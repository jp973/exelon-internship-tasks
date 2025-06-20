// test-socket-client.js
import { io } from "socket.io-client";

const groupId = '685135fe1122035a7db3bb15';

const socket = io("http://localhost:3000", {
  query: { groupId }, // ✅ Important!
});

socket.on(`notification-${groupId}`, (data) => {
  console.log(' Group Notification received:', data);
});

socket.on("connect", () => {
  console.log(` Connected to socket server as Group ID: ${groupId}`);
});

socket.on("disconnect", () => {
  console.log(" Disconnected from socket server");
});
