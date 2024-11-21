import express from 'express';
import path from 'path';
import debug0 from "debug";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { PrismaClient } from '@prisma/client';


const debug = debug0('Chat-API:server');
const app = express();
const prisma = new PrismaClient();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({origin: '*'}))
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname,"..","/public")));


const port = process.env.PORT || '3000';
const start_server = async() => {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`The server is listening on http://localhost:${port}`)
    })
  } catch (e) {
    console.error("Error launching the server: ", e);
    process.exit(1)
  }
}

start_server()