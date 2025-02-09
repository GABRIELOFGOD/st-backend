
import { User } from '../../../features/user/entities/userEntity';

export async function checkLastLogin(user: User) {
  let hasChecked = false;
  const lastLogin = user.lastLogin;
  const now = new Date();
  const diff = now.getTime() - lastLogin.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours > 24) {
    hasChecked = false;
  } else {
    hasChecked = true;
  }
  return hasChecked;
}
