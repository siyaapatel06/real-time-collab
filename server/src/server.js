require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);
  
    // JOIN DOCUMENT ROOM
    socket.on("join-document", (documentId) => {
      socket.join(documentId);
      console.log("Joined room:", documentId);
    });
  
    // SEND CHANGES TO OTHER USERS
    socket.on("send-changes", ({ documentId, content }) => {
      console.log("Sending changes:", content);
      socket.to(documentId).emit("receive-changes", content);
    });
  
    // TYPING INDICATOR
    socket.on("typing", (documentId) => {
      socket.to(documentId).emit("user-typing");
    });
  
    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();