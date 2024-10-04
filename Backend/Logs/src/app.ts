import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from "express";
import { json } from "body-parser";
import Routes from './main/routes/index.routes';

const app = express();
app.use(json());

app.get('/api/v2/logs/test', (req, res,next)=>{
   res.status(200).send({message: `Test successful`})
});
Routes(app);

app.all('*', (req: Request, res: Response) => {
   res.status(404).json({ message: `${req.originalUrl} not found` });
});

export { app }
