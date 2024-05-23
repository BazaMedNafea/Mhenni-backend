// index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import categoriesRoute from "./routes/CategoriesRoute";
import servicesRoute from "./routes/ServicesRoute";
import providersRoute from "./routes/ProvidersRoute";
import MyOrdersRoute from "./routes/MyOrdersRoute";
import MyUserRoute from "./routes/MyUserRoute";
import MyProviderRoute from "./routes/MyProviderRoute";
import MyCustomerRoute from "./routes/MyCustomerRoute";
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});

app.use("/api/public/category", categoriesRoute);
app.use("/api/public/service", servicesRoute);
app.use("/api/public/provider", providersRoute);

app.use("/api/my/user", MyUserRoute);
app.use("/api/my/provider", MyProviderRoute);
app.use("/api/my/customer", MyCustomerRoute);
app.use("/api/my/orders", MyOrdersRoute);
app.listen(8080, () => {
  console.log("server started on localhost:8080");
});
