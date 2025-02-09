import { NextFunction, Request, Response } from "express";
import { TaskStatus, TaskType } from "../../core/utils/types";
import { dataSource } from "../../core/config/datasource";
import { Repository } from "typeorm";
import { Task } from "./entities/taskEntity";
import { User } from "../user/entities/userEntity";
import catchAsync from "../../core/catchAsync/catchAsyncHandler";
import { Participant } from "./entities/taskParticipationEntity";
import { telegram } from "./services/Telegram";

interface RequestBody {
  type: TaskType;
  description: string;
  url: string;
  wallet: string;
  username: string;
  points: number;
  action: string;
  mandatory?: boolean;
}

const taskRepository: Repository<Task> = dataSource.getRepository(Task);
const userRepository: Repository<User> = dataSource.getRepository(User);
const participantRepository: Repository<Participant> = dataSource.getRepository(Participant);

export const addTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, description, url, username, points, action, wallet, mandatory }: RequestBody = req.body;

    if (!type || !description || !url || !username || !points || !action || !wallet) return res.status(400).json({
      status: "failed",
      message: "All input fields are required"
    });
    
    const taskExists = await taskRepository.findOne({ where: { url } });
    if (taskExists) {
      return res.status(400).json({
        status: "failed",
        message: "Task already exists",
      });
    }

    const taskUploader = await userRepository.findOne({
      where: { wallet }
    });

    if (!taskUploader) return res.status(404).json({
      status: "failed",
      message: "Please connect wallet to upload task"
    });
    
    const newTask = taskRepository.create({ type, description, url, username, points, action, uploader: taskUploader, mandatory: mandatory || false });
    await taskRepository.save(newTask);

    // Add task to database
    res.status(200).json({
      status: "success",
      message: "Task added successfully",
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: err
    });
  }
});

export const getTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await taskRepository.find({
      // relations: ["uploader", "participants", "participants.user"]
      relations: ["participants", "participants.user"]
    });
    res.status(200).json({
      status: "success",
      message: "Tasks fetched successfully",
      tasks: tasks.filter(task => task.status == TaskStatus.AVAILABLE)
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong"
    });
  }
});

export const settleTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { taskId, participantId, status } = req.body;
  const task = await taskRepository.findOne({
    where: { id: taskId },
    relations: ["participants"]
  });

  if (!task) return res.status(404).json({
    status: "failed",
    message: "Task not found"
  });

  const participant = await participantRepository.findOne({
    where: { id: participantId },
    relations: ["user"]
  });

  if (!participant) return res.status(404).json({
    status: "failed",
    message: "Participant not found"
  });

  const user = await userRepository.findOne({
    where: { wallet: participant.user.wallet },
    relations: ["tasks", "participants"]
  });

  if (!user) return res.status(404).json({
    status: "failed",
    message: "User not found"
  });

  if (status === "completed") {
    participant.completed = status;
    await participantRepository.save(participant);

    user.points += Number(task.points);
    await userRepository.save(user);

  } else {
    // ============== REMOVE PARTICIPANT FROM TASK AND USER ============== //
    task.participants.splice(task.participants.indexOf(participant), 1);
    await taskRepository.save(task);

    user.participants.splice(user.participants.indexOf(participant), 1);
    await userRepository.save(user);
    
    // ========= DELETE PARTICIPANT IF TASK IS NOT COMPLETED ========= //
    await participantRepository.delete({ id: participantId });
    
  }

  return res.status(200).json({
    status: "success",
    message: "Task has been settled"
  });
});

export const taskParticipate = catchAsync(async (req: Request, res: Response) => {
  const { taskId, wallet, username } = req.body;

  const task = await taskRepository.findOne({
    where: { id: taskId },
    relations: ["participants", "uploader"]
  });

  if (!task) return res.status(404).json({ status: "failed", message: "Task not found" });

  const user = await userRepository.findOne({
    where: { wallet },
    relations: ["participants", "tasks"]
  });

  if (!user) return res.status(404).json({ status: "failed", message: "User not found" });

  // ============= CHECK IF USER HAS PARTICIPATED IN TASK ============= //
  const checkParticipation = await participantRepository.findOne({
    where: { user, task },
  });

  if (checkParticipation) return res.status(400).json({ status: "failed", message: "User has already participated in this task" });

 if (task.type == TaskType.TELEGRAM) {
  //  ================== CHECKING IF USERNAME HAS PARTICIPATED IN TASK ALREADY ================== //
    const checkUsername = await participantRepository.findOne({ where: { username } });
    if (checkUsername) return res.status(400).json({ status: "failed", message: "Username has already participated in this task" });
  
    const autoTask = await telegram(username);
    console.log("response from telegram", autoTask);
    if (autoTask.status !== "OK") return res.status(400).json({ status: "failed", message: "User does not exist on Telegram" });

    const newParticipant = participantRepository.create({ user, task, username, completed: "completed" });
  
    await participantRepository.save(newParticipant);

    user.points += Number(task.points);
    await userRepository.save(user);

    return res.status(200).json({ status: "success", message: "Task completed successfully" });
 } else {
   // Create a new participant
   const newParticipant = participantRepository.create({ user, task, username, completed: "pending" });
   await participantRepository.save(newParticipant);
 
   // Ensure participants array is initialized before pushing
   if (!task.participants) task.participants = [];
   task.participants.push(newParticipant);
   await taskRepository.save(task);
 
   // Ensure participants array in User is initialized
   if (!user.participants) user.participants = [];
   user.participants.push(newParticipant);
   await userRepository.save(user);
 
   return res.status(200).json({ status: "success", message: "Task is under review" });
 }
});

export const endTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.body;

  if (!taskId) return res.status(400).json({
    status: "failed",
    message: "Task ID is required to end task"
  });

  const task = await taskRepository.findOne({
    where: {id: taskId}
  });

  if (!task) return res.status(400).json({
    status: "failed",
    message: "Task not found"
  });

  if (task.status === TaskStatus.COMPLETED) return res.status(400).json({
    status: "failed",
    message: "Task ended already!"
  });

  task.status = TaskStatus.COMPLETED;
  taskRepository.save(task);

  res.json({
    status: "success",
    message: "Status ended successfully!"
  });
  
});
