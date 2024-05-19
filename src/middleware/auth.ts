import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      customerId: string;
      providerId: string;
      auth0Id: string;
    }
  }
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decoded.sub;

    // Query the database to get the user based on auth0Id
    const user = await prisma.user.findFirst({
      where: {
        auth0Id: {
          equals: auth0Id,
        },
      },
      include: {
        provider: true, // Include the provider relation
        customer: true, // Include the customer relation
      },
    });

    if (!user) {
      return res.sendStatus(401);
    }

    req.auth0Id = auth0Id as string;

    // Assign customerId from the customer relation
    if (user.customer) {
      req.customerId = user.customer.id.toString();
    }

    // Extract providerId if user is a provider
    if (user.provider) {
      req.providerId = user.provider.id.toString();
    }

    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
