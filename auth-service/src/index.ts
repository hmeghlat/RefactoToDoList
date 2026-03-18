//accès a la lib express
import express from "express";
import connectDB from "./config/bd.js";
import cors from "cors";
import createAuthRouter from "./routes/auth.js";

const app = express();
const port = process.env.PORT || 3000;

//connection a la bdd
const db = connectDB();

//middlware qui permet de traiter les données de la requete 
app.use(express.json()); 
app.use(express.urlencoded({extended :false}));
app.use(cors());

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "ok" });
});

app.use("/auth", createAuthRouter(db));

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (err instanceof SyntaxError) {
		res.status(400).json({ message: "Invalid JSON" });
		return;
	}
	next(err);
});



//lancer le serveur 
app.listen(port,() => console.log("serveur demarré sur le port : "+port));