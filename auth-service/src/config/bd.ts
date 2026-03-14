import mysql from "mysql2";
import type { Connection } from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connectDB = (): Connection => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "authdb",
  });

  connection.connect((err) => {
    if (err) {
      console.error("Erreur de connexion à MySQL:", err);
      return;
    }
    console.log("Connecté à la base de données MySQL");
  });
  return connection;
};

export default connectDB;