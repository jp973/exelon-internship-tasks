import { Server } from 'socket.io';
import { Notification } from '../models/db/notification';
import { MemberNotification } from '../models/db/MemberNotification';

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  const memberId = socket.handshake.query.memberId as string;

  const finalId = userId || memberId;
  if (finalId) {
    const roomName = `notification-${finalId}`;
    socket.join(roomName);
    console.log(`🔌 ${userId ? 'User' : 'Member'} ${finalId} joined room ${roomName}`);
  } else {
    console.warn("❌ Connection rejected: No userId or memberId provided.");
  }

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


  return io;
};

// ✅ Generic notification sender for both user & member
export function sendNotification(
  userId: string,
  message: string,
  data: any = {},
  role: 'user' | 'member' = 'user' // default is user
) {
  try {
    if (!io) throw new Error("Socket.IO server not initialized");

    // Emit to the appropriate room
    io.to(`notification-${userId}`).emit(`notification-${userId}`, {
      userId,
      message,
      data,
    });

    // Save to DB based on role
    const NotificationModel = role === 'member' ? MemberNotification : Notification;

    const newNotification = new NotificationModel({
      userId,
      message,
      data,
    });

    newNotification.save().catch((err) => {
      console.error("❌ Error saving notification to DB:", err);
    });

  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
