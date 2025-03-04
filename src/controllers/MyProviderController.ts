// MyProviderController.ts
import { Request, Response } from "express";
import { PrismaClient, ProviderOffer, RequestState } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
const prisma = new PrismaClient();

const addServiceForProvider = async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      billingRatePerHour,
      experienceInMonths,
      serviceOfferingDesc,
    } = req.body;
    const providerId = req.providerId;
    const serviceImage = req.file as Express.Multer.File; // Get the uploaded file

    const serviceIdInt = parseInt(serviceId, 10);
    const billingRatePerHourFloat = parseFloat(billingRatePerHour);
    const experienceInMonthsInt = parseInt(experienceInMonths, 10);

    if (
      isNaN(serviceIdInt) ||
      isNaN(billingRatePerHourFloat) ||
      isNaN(experienceInMonthsInt)
    ) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    const existingService = await prisma.service.findUnique({
      where: { id: serviceIdInt },
    });

    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    const existingServiceProviderMap =
      await prisma.serviceProviderMap.findFirst({
        where: {
          service_id: serviceIdInt,
          provider_id: providerId,
        },
      });

    if (existingServiceProviderMap) {
      return res
        .status(400)
        .json({ message: "You already offer this service" });
    }

    let imageUrl = null;
    if (serviceImage) {
      const base64Image = Buffer.from(serviceImage.buffer).toString("base64");
      const dataURI = `data:${serviceImage.mimetype};base64,${base64Image}`;

      // Upload image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataURI);
      imageUrl = uploadResponse.secure_url;
    }

    // Create a new service provider map
    const serviceProviderMap = await prisma.serviceProviderMap.create({
      data: {
        service_id: serviceIdInt,
        provider_id: providerId,
        billing_rate_per_hour: billingRatePerHourFloat,
        experience_in_months: experienceInMonthsInt,
        service_offering_desc: serviceOfferingDesc,
        image: imageUrl, // Add the image URL to the record
      },
    });

    res.status(201).json(serviceProviderMap);
  } catch (error) {
    console.error("Error adding service for provider:", error);
    res.status(500).json({ message: "Error adding service for provider" });
  }
};

const getProviderRequests = async (req: Request, res: Response) => {
  try {
    const { providerId } = req;

    if (!providerId) {
      return res.status(401).json({ message: "Provider ID not found" });
    }

    const providerRequests = await prisma.request.findMany({
      where: { providerId },
      include: {
        Service: true,
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true, // Include the 'image' field
              },
            },
          },
        },
        Address: true,
      },
    });

    // Map the address details to each request
    const requestsWithAddressAndImage = providerRequests.map((request) => ({
      ...request,
      customerAddress: request.Address
        ? `${request.Address.street}, ${request.Address.city}, ${request.Address.wilaya}, ${request.Address.zip}`
        : "No address provided",
      customerImage: request.customer?.user?.image || "", // Access the user's image
    }));

    res.json(requestsWithAddressAndImage);
  } catch (error) {
    console.error("Error fetching provider requests:", error);
    res.status(500).json({ message: "Error fetching provider requests" });
  }
};

const getProviderServices = async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId; // Extract providerId from authentication token

    if (!providerId) {
      return res.status(401).json({ message: "Provider ID not found" });
    }

    const providerServices = await prisma.serviceProviderMap.findMany({
      where: { provider_id: providerId },
      include: {
        service: {
          include: {
            service_category: true,
          },
        },
      },
    });

    res.json(providerServices);
  } catch (error) {
    console.error("Error fetching provider services:", error);
    res.status(500).json({ message: "Error fetching provider services" });
  }
};

const updateProviderService = async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId;
    const serviceProviderMapId = parseInt(req.params.id, 10);
    const { billingRatePerHour, experienceInMonths, serviceOfferingDesc } =
      req.body;

    if (!providerId || isNaN(serviceProviderMapId)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const updatedServiceProviderMap =
      await prisma.serviceProviderMap.updateMany({
        where: {
          id: serviceProviderMapId,
          provider_id: providerId,
        },
        data: {
          billing_rate_per_hour: billingRatePerHour,
          experience_in_months: experienceInMonths,
          service_offering_desc: serviceOfferingDesc,
        },
      });

    if (updatedServiceProviderMap.count === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service updated successfully" });
  } catch (error) {
    console.error("Error updating provider service:", error);
    res.status(500).json({ message: "Error updating provider service" });
  }
};

const deleteProviderService = async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId;
    const serviceProviderMapId = parseInt(req.params.id, 10);

    if (!providerId || isNaN(serviceProviderMapId)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const deletedServiceProviderMap =
      await prisma.serviceProviderMap.deleteMany({
        where: {
          id: serviceProviderMapId,
          provider_id: providerId,
        },
      });

    if (deletedServiceProviderMap.count === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider service:", error);
    res.status(500).json({ message: "Error deleting provider service" });
  }
};

const createProviderOffer = async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId;
    const requestId = parseInt(req.params.requestId, 10);
    const { offerDates, offerTimes } = req.body;

    if (!providerId || isNaN(requestId) || !offerDates || !offerTimes) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Check if the request exists and is in the REQUESTED state
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { providerOffers: true },
    });

    if (!request || request.state !== RequestState.REQUESTED) {
      return res.status(400).json({ message: "Invalid request state" });
    }

    // Check if the provider has already offered for this request
    if (
      request.providerOffers.some((offer) => offer.providerId === providerId)
    ) {
      return res
        .status(400)
        .json({ message: "You have already offered for this request" });
    }

    // Create provider offers
    const providerOffers: ProviderOffer[] = [];
    for (let i = 0; i < offerDates.length && i < offerTimes.length; i++) {
      const offerDate = new Date(offerDates[i]);
      const offerTime = new Date(offerTimes[i]);
      const providerOffer = await prisma.providerOffer.create({
        data: {
          requestId,
          providerId,
          offerDate,
          offerTime,
        },
      });
      providerOffers.push(providerOffer);
    }

    // Update the request state to OFFERED
    await prisma.request.update({
      where: { id: requestId },
      data: { state: RequestState.OFFERED },
    });

    res.json(providerOffers);
  } catch (error) {
    console.error("Error creating provider offer:", error);
    res.status(500).json({ message: "Error creating provider offer" });
  }
};

const confirmRequestCompletion = async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId;
    const requestId = parseInt(req.params.requestId, 10);

    if (!providerId || isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Find the request to ensure it belongs to the provider
    const providerRequest = await prisma.request.findFirst({
      where: {
        id: requestId,
        providerId: providerId,
      },
    });

    if (!providerRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (providerRequest.state !== RequestState.ONGOING) {
      return res
        .status(400)
        .json({ message: "Request is not in an ongoing state" });
    }

    // Update the request state to COMPLETED
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { providerConfirmation: true },
    });

    res.json({
      message: "Request marked as completed",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error confirming request completion:", error);
    res.status(500).json({ message: "Error confirming request completion" });
  }
};

export default {
  addServiceForProvider,
  getProviderRequests,
  getProviderServices,
  updateProviderService,
  deleteProviderService,
  createProviderOffer,
  confirmRequestCompletion,
};
