// import { IParticipant, TaskStatus, TaskType } from "../../../core/utils/types";
// import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import { User } from "../../user/entities/userEntity";
// import { Participant } from "./taskParticipationEntity";

// @Entity("task")
// export class Task {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column({ type: "enum", enum: TaskType })
//   type!: TaskType;

//   @Column()
//   points!: number;

//   @Column()
//   description!: string;

//   @Column()
//   url!: string;

//   @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.AVAILABLE })
//   status!: TaskStatus;

//   @Column()
//   username!: string;

//   @Column()
//   action!: string;

//   @ManyToOne(() => User, (user) => user.id)
//   uploader!: User;

//   @OneToMany(() => Participant, (participant) => participant.task, { cascade: true })
//   participants!: Participant[];

//   @Column({ default: false })
//   mandatory!: boolean;
// }


import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/userEntity";
import { Participant } from "./taskParticipationEntity";
import { TaskStatus, TaskType } from "../../../core/utils/types";

@Entity("task")
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: TaskType })
  type!: TaskType;

  @Column()
  points!: number;

  @Column()
  description!: string;

  @Column()
  url!: string;

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.AVAILABLE })
  status!: TaskStatus;

  @Column()
  username!: string;

  @Column()
  action!: string;

  @ManyToOne(() => User, (user) => user.tasks)
  uploader!: User;

  @OneToMany(() => Participant, (participant) => participant.task, { cascade: true })
  participants!: Participant[];

  @Column({ default: false })
  mandatory!: boolean;
}
