import mysql from "mysql2";
import type { Connection } from "mysql2";
import "dotenv/config";

const connectDB = (): Connection => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "taskdb",
  });

  connection.connect((err) => {
    if (err) {
      console.error("Task-service MySQL connection error:", err);
      return;
    }
    console.log("Task-service connected to MySQL");
  });

  return connection;
};

export default connectDB;
