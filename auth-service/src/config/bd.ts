import mysql from "mysql2";
import type { Pool } from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connectDB = (): Pool => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "authdb",
    waitForConnections: true,
    connectionLimit: 10,
  });

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Erreur de connexion à MySQL:", err);
      return;
    }
    console.log("Connecté à la base de données MySQL");
    connection.release();
  });

  return pool;
};

export default connectDB;
