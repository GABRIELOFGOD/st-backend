import { User } from "../../features/user/entities/userEntity";

export enum TaskType {
  INSTAGRAM = "instagram",
  FACEBOOK = "facebook",
  X = "x",
  DISCORD = "discord",
  YOUTUBE = "youtube",
  TIKTOK = "tiktok",
  TELEGRAM = "telegram",
  MEDIUM = "medium",
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  AVAILABLE = "available",
}

export enum AccountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface IParticipant {
  user: User;
  completed: "pending" | "completed";
  username: string;
}

