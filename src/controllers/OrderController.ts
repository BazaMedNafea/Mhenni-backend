import Stripe from "stripe";
import { PrismaClient, Request } from "@prisma/client";
import { Request as ExpressRequest, Response } from "express";

const prisma = new PrismaClient();

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: "2020-08-27", // Ensure you are using the correct Stripe API version
});

const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
};

const OrderController = {
  getMyOrders: async (req: ExpressRequest, res: Response) => {
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
  },

  stripeWebhookHandler: async (req: ExpressRequest, res: Response) => {
    let event;

    try {
      const sig = req.headers["stripe-signature"] as string;
      event = STRIPE.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_ENDPOINT_SECRET
      );
    } catch (error: any) {
      console.log(error);
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const orderId = event.data.object.metadata?.orderId;

      if (!orderId) {
        return res
          .status(404)
          .json({ message: "Order ID not found in metadata" });
      }

      try {
        await prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            totalAmount: event.data.object.amount_total,
            status: "paid",
          },
        });
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .json({ message: "Failed to update order status" });
      }
    }

    res.status(200).send();
  },

  createCheckoutSession: async (req: ExpressRequest, res: Response) => {
    try {
      const checkoutSessionRequest: CheckoutSessionRequest = req.body;

      const restaurant = await prisma.restaurant.findUnique({
        where: {
          id: checkoutSessionRequest.restaurantId,
        },
      });

      if (!restaurant) {
        throw new Error("Restaurant not found");
      }

      const newOrder = await prisma.order.create({
        data: {
          restaurant: {
            connect: {
              id: restaurant.id,
            },
          },
          user: {
            connect: {
              id: req.userId,
            },
          },
          status: "placed",
          deliveryDetails: {
            create: checkoutSessionRequest.deliveryDetails,
          },
          cartItems: {
            createMany: {
              data: checkoutSessionRequest.cartItems.map((cartItem) => ({
                menuItemId: cartItem.menuItemId,
                name: cartItem.name,
                quantity: parseInt(cartItem.quantity),
              })),
            },
          },
        },
      });

      const lineItems = createLineItems(
        checkoutSessionRequest,
        restaurant.menuItems
      );

      const session = await createSession(
        lineItems,
        newOrder.id,
        restaurant.deliveryPrice,
        restaurant.id
      );

      if (!session.url) {
        return res
          .status(500)
          .json({ message: "Error creating stripe session" });
      }

      res.json({ url: session.url });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.raw.message });
    }
  },
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: any[] // Adjust as per your MenuItemType
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find((item) => item.id === cartItem.menuItemId);

    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "gbp",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "gbp",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });

  return sessionData;
};

export default OrderController;
