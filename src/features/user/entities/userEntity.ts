// import { Task } from "../../task/entities/taskEntity";
// import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

// @Entity("user")
// export class User {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column({ unique: true })
//   wallet!: string;

//   @Column({ type: "decimal", precision: 10, scale: 4, default: "0.00" })
//   points!: number;

//   @OneToMany(() => Task, (task) => task.id)
//   tasks!: Task[];

//   @Column({ default: "user", type: "enum", enum: ["user", "admin"] })
//   role!: string;
// }

import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "../../task/entities/taskEntity";
import { Participant } from "../../task/entities/taskParticipationEntity";
import { AccountStatus } from "../../../core/utils/types";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  wallet!: string;

  // @Column({ type: "decimal", precision: 10, scale: 4, default: "0.00" })
  @Column({ type: "decimal", precision: 15, scale: 4, default: 0 })
  points!: number;

  @OneToMany(() => Task, (task) => task.uploader)
  tasks!: Task[];

  @ManyToOne(() => User, (user) => user.referrers)
  referrer!: User;
  
  @OneToMany(() => User, (user) => user.referrer)
  referrers!: User[];

  @OneToMany(() => Participant, (participant) => participant.user)
  participants!: Participant[];

  @Column({ default: "user", type: "enum", enum: ["user", "admin"] })
  role!: string;

  @Column({ type: "timestamp", nullable: true })
  lastLogin!: Date;

  @Column({ default: AccountStatus.ACTIVE, type: "enum", enum: AccountStatus })
  status!: AccountStatus;
}
