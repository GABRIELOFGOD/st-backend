import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../../features/user/entities/userEntity";
import { Task } from "../../features/task/entities/taskEntity";
import { Participant } from "../../features/task/entities/taskParticipationEntity";

config();

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Task, Participant],
  synchronize: true,
});
