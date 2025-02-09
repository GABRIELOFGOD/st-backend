import { Repository } from "typeorm";
import catchAsync from "../../core/catchAsync/catchAsyncHandler";
import { NextFunction, Request, Response } from "express";
import { User } from "./entities/userEntity";
import { dataSource } from "../../core/config/datasource";
import { checkLastLogin } from "../task/services/dailyLogin";

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

export const checkUserCheckIn = catchAsync(async (req: Request, res: Response) => {
  const { wallet } = req.body;
  const user = await userRepository.findOne({
    where: { wallet }
  });

  if (!user) return res.status(404).json({
    status: "failed",
    message: "User not found"
  });
  
  const hasChecked = await checkLastLogin(user);
  if (hasChecked) return res.status(200).json({
    status: "success",
    message: "User has checked in today",
    checkedLast: true
  });

  return res.status(200).json({
    status: "success",
    message: "User has not checked in today",
    checkedLast: false
  });
});


export const updateLastLogin = catchAsync(async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const user = await userRepository.findOne(userId);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // ================ CHECKING IF USER HAS CHECKED IN TODAY ================ //
    const hasChecked = await checkLastLogin(user);
    if (hasChecked) {
      return res.status(200).json({ status: "success", message: "User has checked in today" });
    }

    user.lastLogin = new Date();
    await userRepository.save(user);

    return res.status(200).json({ status: "success", message: "last login updated" });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: "An error occurred", error: error.message });
  }
});
