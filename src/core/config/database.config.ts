import mysql from "mysql2/promise";

const dbConfig = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("DATABASE CONNECTED SUCCESSFULLY");
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export default dbConfig;
