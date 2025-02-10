import { userRepository } from "../controller";
import { User } from "../entities/userEntity";


export const addReferrer = async (user: User, referrerId: number) => {
  const referrer = await userRepository.findOne({
    where: { id: referrerId },
    relations: ["referrers"]
  });

  if (!referrer) return;

  referrer.referrers.push(user);
  referrer.points = Number(referrer.points) + 1000;
  await userRepository.save(referrer);
};