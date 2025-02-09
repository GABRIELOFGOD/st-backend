import express, { Application, NextFunction, Request, Response } from "express"; 
import morgan from "morgan";
import { config } from "dotenv";
import { AppError, globalErrorHandler } from "./core/error/errorHandling.service";
import { changeUserRole, checkUserCheckIn, getAllUsers, updateLastLogin, userAuth } from "./features/user/controller";
import { isAdmin } from "./core/common/adminAuth";
import { addTask, endTask, getTasks, settleTask, taskParticipate } from "./features/task/task.controller";
import dbConfig from "./core/config/database.config";
import { dataSource } from "./core/config/datasource";
import cors from "cors";

config();
const app: Application = express();
const PORT = process.env.PORT || 5000;
dbConfig();

app.use(morgan("dev"));

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

dataSource.initialize().then(() => {
  console.log("Data Source has been initialized!");
})
.catch((err) => {
  console.error("Error during Data Source initialization", err);
});

app.post("/auth", userAuth);
app.get("/tasks", getTasks);
app.post("/tasks/participate", taskParticipate);

// ============= TASKS ============= //
app.post("/tasks", isAdmin, addTask);
app.post("/settle", isAdmin, settleTask);
app.get("/users", isAdmin, getAllUsers);
app.post("/end", isAdmin, endTask);
app.post("/user/check", checkUserCheckIn);
app.post("/check-in", updateLastLogin);
// app.post("/participate/telegram", telegramTask);

app.post("/change", changeUserRole);

// ========== ERROR HANDLING ========== //
app.all("*", (req: Request, res: Response, next: NextFunction) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
);
// app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});