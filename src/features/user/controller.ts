import { Repository } from "typeorm";
import catchAsync from "../../core/catchAsync/catchAsyncHandler";
import { NextFunction, Request, Response } from "express";
import { User } from "./entities/userEntity";
import { dataSource } from "../../core/config/datasource";

const userRepository: Repository<User> = dataSource.getRepository(User);

export const userAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { wallet } = req.body;
  if (!wallet) {
    return res.status(400).json({
      status: "failed",
      message: "Please connect your wallet",
    });
  }

  const user = await userRepository.findOne({ 
    where: { wallet }
  });

  if (user) return res.status(200).json({
    status: "success",
    message: "User already exists",
    user
  });

  const newUser = userRepository.create({ wallet });
  newUser.points = 100;
  const savedUser = await userRepository.save(newUser);
  return res.status(200).json({
    status: "success",
    message: "user created successfully",
    user: savedUser
  });;

});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userRepository.find({
    relations: ["referrer", "referrers"]
  });
  res.status(200).json({
    status: "success",
    users
  });
});

export const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.body;
  const theUser = await userRepository.findOne({
    where: { id }
  });

  if (!theUser) return res.status(404).json({
    status: "failed",
    message: "User not found"
  });

  theUser.role = "admin";
  const savedUser = await userRepository.save(theUser);

  res.status(200).json({
    status: "success",
    message: "User role changed successfully",
    savedUser
  });
  
});
