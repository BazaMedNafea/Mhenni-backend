import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export default {
  getMyOrders,
  getOrderById,
};
