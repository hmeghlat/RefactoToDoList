import connectDB from "./config/bd.js";
import { createApp } from "./app.js";

const port = process.env.PORT || 3000;
const db = connectDB();
const app = createApp(db);

app.listen(port, () => console.log("serveur demarré sur le port : " + port));