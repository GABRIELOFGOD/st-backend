// import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
// import { Task } from "./taskEntity";
// import { User } from "../../user/entities/userEntity";

// @Entity("participant")
// export class Participant {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @ManyToOne(() => Task, (task) => task.participants)
//   task!: Task;

//   @ManyToOne(() => User)
//   user!: User;

//   @Column({ type: "enum", enum: ["pending", "completed"] })
//   completed!: "pending" | "completed";

//   @Column()
//   username!: string;
// }


import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/userEntity";
import { Task } from "./taskEntity";

@Entity("participant")
export class Participant {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.participants)
  user!: User;

  @ManyToOne(() => Task, (task) => task.participants)
  task!: Task;

  @Column()
  username!: string;

  @Column({ default: "pending", enum: ["pending", "completed"], type: "enum" })
  completed!: string;
}
