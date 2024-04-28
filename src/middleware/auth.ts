import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import customer from "../models/customer"; // Assuming this is your Prisma customer model
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

export const authenticateCustomerJwt = async (
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
    const decoded = jwt.verify(token, "customer_secret_key") as jwt.JwtPayload;
    const auth0Id = decoded.sub;

    // Use findFirst with custom criteria
    const customer = await prisma.customer.findFirst({
      where: {
        auth0Id: {
          equals: auth0Id,
        },
      },
    });

    if (!customer) {
      return res.sendStatus(401);
    }

    req.auth0Id = auth0Id as string;
    req.customerId = customer.id.toString(); // Assuming `id` is the correct field for user ID
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};

export const authenticateProviderJwt = async (
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
    const decoded = jwt.verify(token, "provider_secret_key") as jwt.JwtPayload;
    const auth0Id = decoded.sub;

    // Use findFirst with custom criteria
    const provider = await prisma.provider.findFirst({
      where: {
        auth0Id: {
          equals: auth0Id,
        },
      },
    });

    if (!provider) {
      return res.sendStatus(401);
    }

    req.auth0Id = auth0Id as string;
    req.providerId = provider.id.toString(); // Assuming `id` is the correct field for user ID
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};

export const authenticateJwt = async (
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
    const decoded = jwt.verify(token, "your_secret_key") as jwt.JwtPayload;
    const auth0Id = decoded.sub;

    // Use findFirst with custom criteria
    const customer = await prisma.customer.findFirst({
      where: {
        auth0Id: {
          equals: auth0Id,
        },
      },
    });

    if (!customer) {
      return res.sendStatus(401);
    }

    req.auth0Id = auth0Id as string;
    req.customerId = customer.id.toString(); // Assuming `id` is the correct field for user ID
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, "your_secret_key");

    // You can add additional checks here, like checking for token expiration, audience, etc.

    return true;
  } catch (error) {
    // Token is invalid or expired
    return false;
  }
};

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

    // Use findFirst with custom criteria
    const customer = await prisma.customer.findFirst({
      where: {
        auth0Id: {
          equals: auth0Id,
        },
      },
    });

    if (!customer) {
      return res.sendStatus(401);
    }

    req.auth0Id = auth0Id as string;
    req.customerId = customer.id.toString(); // Assuming `id` is the correct field for user ID
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
