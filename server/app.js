import { createServer } from 'http';
import socketIO from 'socket.io';
import path from 'path';
import EVENTS from '../common/socket-events';
import usersRepo from './users-repository';
import socketControllerFactory from './socket-controller';

export const initApp = (app) => {
  const http = createServer(app);
  const io = socketIO(http);
  const usersRepository = usersRepo.getInstance();

  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/index.html'));
  });

  io.on('connect', (socket) => {
    console.log('a new user (socket) connected');
    const socketController = socketControllerFactory(socket, usersRepository);

    // Setup socket disconnection listener
    socket.on('disconnect', socketController.handleDisconnect);

    // Setup adding new user listener
    socket.on(EVENTS.USER_PERSIST_ATTEMPT, socketController.getPersistedUser);
    socket.on(EVENTS.USER_ADD, socketController.handleUserAdd);
  });

  const PORT = process.env.PORT || 3000;

  http.listen(PORT, () => {
    console.log(`Socket chat app listening at http://localhost:${PORT}`);
  });

  return app;
};
