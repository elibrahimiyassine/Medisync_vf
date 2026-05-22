import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './jwt';
import { logger } from './logger';

const userSockets = new Map<string, string[]>();

export const setupSocketIO = (io: Server): void => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      (socket as any).role = payload.role;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Track user sockets
    const existing = userSockets.get(userId) || [];
    userSockets.set(userId, [...existing, socket.id]);

    socket.join(`user:${userId}`);
    socket.join(`role:${(socket as any).role}`);

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId) || [];
      userSockets.set(userId, sockets.filter(s => s !== socket.id));
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const emitToUser = (io: Server, userId: string, event: string, data: any): void => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToRole = (io: Server, role: string, event: string, data: any): void => {
  io.to(`role:${role}`).emit(event, data);
};
