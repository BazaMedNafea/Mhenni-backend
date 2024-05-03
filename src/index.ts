import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import myUserRoute from "./routes/MyUserRoute";
//import categoryRoute from "./routes/CategoriesRoute";
/*import ProvidersRoute from "./routes/ProvidersRoute";
import ServicesRoute from "./routes/ServicesRoute"; // Import the ServicesRoute
import myServicesRoute from "./routes/myServicesRoute"; // Import the new route*/

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});

app.use("/api/my/user", myUserRoute);

// app.use("/api/category", categoryRoute);
// app.use("/api/provider", ProvidersRoute);
// app.use("/api/service", ServicesRoute);
// app.use("/api/my/service", myServicesRoute); // Add the new route

app.listen(8080, () => {
  console.log("server started on localhost:8080");
});
