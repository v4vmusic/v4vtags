import express, { Express, Request, Response } from "express";
import dotenv  from "dotenv"
import mongoose, { ConnectOptions } from "mongoose";
import itemsRouter from './routes/items.js';
import tagsRouter from './routes/tags.js';
import cors from 'cors';



dotenv.config();

const app: Express = express();
const host = process.env.HOST;
const port = process.env.PORT;
const databaseURL = process.env.DATABASE_URL ?? '';


mongoose.connect(databaseURL, {});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(cors());
app.use('/items', itemsRouter);
app.use('/tags', tagsRouter);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});



