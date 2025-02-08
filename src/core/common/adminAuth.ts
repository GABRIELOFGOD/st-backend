import { NextFunction, Request, Response } from "express";
import { User } from "../../features/user/entities/userEntity";
import { dataSource } from "../config/datasource";
import { Repository } from "typeorm";
import catchAsync from "../catchAsync/catchAsyncHandler";
const userRepository: Repository<User> = dataSource.getRepository(User);

export const isAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = Array.isArray(req.headers['wallet']) ? req.headers['wallet'][0] : req.headers['wallet'];
    if (!wallet) {
      return res.status(400).json({
        status: "failed",
        message: "Please connect your wallet",
      });
    }

    const user = await userRepository.findOne({ 
      where: { wallet }
    });

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "User does not exist",
      });
    }

    if (user.role != "admin") {
      return res.status(400).json({
        status: "failed",
        message: "Operation denied",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong"
    });
  }
});