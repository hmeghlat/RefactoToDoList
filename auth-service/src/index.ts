//accès a la lib express
import express from "express";
import connectDB from "./config/bd.js";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

//connection a la bdd
connectDB();

//middlware qui permet de traiter les données de la requete 
app.use(express.json()); 
app.use(express.urlencoded({extended :false}));
app.use(cors());



//lancer le serveur 
app.listen(port,() => console.log("serveur demarré sur le port : "+port));