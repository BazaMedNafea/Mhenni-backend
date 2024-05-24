import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const addServiceRequest = async (req: Request, res: Response) => {
  try {
    const { serviceId, requirementDesc, providerId, customAddress } = req.body;

    // Get the customerId from the authenticated user's information
    const customerId = req.customerId;

    // Validate input data
    if (!customerId || !serviceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the customer and service objects
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!customer || !service) {
      return res.status(404).json({ message: "Customer or service not found" });
    }

    // Create a new service request with initial state as PENDING
    const newRequest = await prisma.request.create({
      data: {
        customer: { connect: { id: customerId } },
        service: { connect: { id: serviceId } },
        requirement_desc: requirementDesc,
        provider: { connect: { id: providerId } },
        custom_address_street: customAddress?.street,
        custom_address_city: customAddress?.city,
        custom_address_wilaya: customAddress?.wilaya,
        custom_address_zip: customAddress?.zip,
        state: "REQUESTED", // Set initial state
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ message: "Error creating service request" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const customerId = req.customerId;

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await prisma.request.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        service: true,
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        DeliveryOffer: true,
        Address: true,
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const customerId = req.customerId;
    const orderId = parseInt(req.params.orderId, 10);

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await prisma.request.findFirst({
      where: {
        id: orderId,
        customer_id: customerId,
      },
      include: {
        service: true,
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        DeliveryOffer: true,
        Address: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const getMyCustomerRequests = async (req: Request, res: Response) => {
  try {
    const customerId = req.customerId;

    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const customerRequests = await prisma.request.findMany({
      where: { customer_id: customerId },
      include: {
        service: true,
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
        Address: true,
        DeliveryOffer: true,
        providerOffers: true, // Include providerOffers
      },
    });

    const requestsWithAddressAndDeliveryOffer = customerRequests.map(
      (request) => ({
        ...request,
        customerAddress: request.Address
          ? `${request.Address.street}, ${request.Address.city}, ${request.Address.wilaya}, ${request.Address.zip}`
          : "No address provided",
        providerImage: request.provider?.user?.image || "",
        deliveryOffer:
          request.DeliveryOffer.length > 0 ? request.DeliveryOffer[0] : null,
        providerOffers: request.providerOffers || [], // Include providerOffers
      })
    );

    res.json(requestsWithAddressAndDeliveryOffer);
  } catch (error) {
    console.error("Error fetching customer requests:", error);
    res.status(500).json({ message: "Error fetching customer requests" });
  }
};

export const getMyCustomerRequestById = async (req: Request, res: Response) => {
  try {
    const customerId = req.customerId;
    const requestId = parseInt(req.params.id, 10);

    if (!customerId || isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const customerRequest = await prisma.request.findFirst({
      where: {
        id: requestId,
        customer_id: customerId,
      },
      include: {
        service: true,
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
        Address: true,
        DeliveryOffer: true,
        providerOffers: true, // Include providerOffers
      },
    });

    if (!customerRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    const requestWithAddressAndDeliveryOffer = {
      ...customerRequest,
      customerAddress: customerRequest.Address
        ? `${customerRequest.Address.street}, ${customerRequest.Address.city}, ${customerRequest.Address.wilaya}, ${customerRequest.Address.zip}`
        : "No address provided",
      providerImage: customerRequest.provider?.user?.image || "",
      deliveryOffer:
        customerRequest.DeliveryOffer.length > 0
          ? customerRequest.DeliveryOffer[0]
          : null,
      providerOffers: customerRequest.providerOffers || [], // Include providerOffers
    };

    res.json(requestWithAddressAndDeliveryOffer);
  } catch (error) {
    console.error("Error fetching customer request by ID:", error);
    res.status(500).json({ message: "Error fetching customer request by ID" });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const customerId = req.customerId;
    const requestId = parseInt(req.params.requestId, 10);
    const { expectedStartTime } = req.body;

    if (!customerId || isNaN(requestId) || !expectedStartTime) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const customerRequest = await prisma.request.findFirst({
      where: {
        id: requestId,
        customer_id: customerId,
      },
    });

    if (!customerRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update the request with the new expected start time and state
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        expected_start_time: expectedStartTime,
        state: "ONGOING",
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ message: "Error updating request status" });
  }
};
export default {
  updateRequestStatus,
  getMyCustomerRequests,
  getMyCustomerRequestById,
  addServiceRequest,
  getMyOrders,
  getOrderById,
};
