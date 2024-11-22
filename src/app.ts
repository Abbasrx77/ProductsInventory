import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { initializeSocket } from './controllers/produit.ts';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import usersRouter from './routes/user.ts';
import produitRouter from './routes/produit.ts';
import { notFound } from './middlewares/not-found.ts';
import { errorHandler } from './middlewares/error-handler.js';
import bodyParser from 'body-parser';
import {ProduitService} from "./services/produit.js";

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));
app.use(cookieParser());

app.use('/', usersRouter);
app.use('/', produitRouter);

app.use(notFound);
app.use(errorHandler);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
  },
});

initializeSocket(io);

io.on('connection', (socket) => {
  console.log('client connected: ', socket.id);

  ProduitService.getAllProduit(20, 0).then((produits) => {
    socket.emit('updatedProduits', produits);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected: ', socket.id);
  });
});

const port = process.env.PORT || '3000';
const start_server = async () => {
  try {
    await prisma.$connect();
    httpServer.listen(port, () => {
      console.log(`The server is listening on http://localhost:${port}`);
    });
  } catch (e) {
    console.error('Error launching the server: ', e);
    process.exit(1);
  }
};

start_server();