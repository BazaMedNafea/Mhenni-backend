import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import myCustomerRoute from "./routes/MyCustomerRoute";

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});

app.use("/api/my/customer", myCustomerRoute);

app.listen(10000, () => {
  console.log("server started on localhost:8080");
});
