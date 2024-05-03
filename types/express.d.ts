import { Request } from "express";

// Extend the Express Request type to include a userId property
declare module "express" {
  interface Request {
    userId?: string;
  }
}
