export const telegram = async (username: string) => {
    try {
      const url = `${process.env.TELEGRAM_URL}${username}`;
      const request = await fetch(url);
      const response = await request.json();
      return response;
    } catch (error: any) {
      return error;
    }
}