const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const UserRoutes = require("./routes/user.route");
const PostRoutes = require("./routes/post.route");
const MessageRoutes = require("./routes/message.route");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./utils/dbConnect");
const { ErrorHandler } = require("./utils/features");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: process.env.CLIENT_URL });
let users = [];
io.on("connection", (socket) => {
  console.log(socket.id + " connected...");
  socket.on("user_join", (userId) => {
    users.push({ socketId: socket.id, userId });
    console.log(users);
  });
  socket.on("disconnect", () => {
    console.log("disconneted", socket.id);
    users = users.filter((usr) => usr.socketId !== socket.id);
    console.log(users);
  });
  socket.on("liked_unliked_post", function ([post, myInfo]) {
    const ids = [...post.creator?.followers, post.creator?._id];
    const clients = users.filter((usr) => ids.includes(usr.userId));
    clients?.map((client) => {
      socket.to(client.socketId).emit("liked_unliked_post", post);
      socket
        .to(client.socketId)
        .emit("notification", `${myInfo.name} likes or dislike your post`);
    });
  });
  socket.on("like-comment", (post) => {
    const ids = [...post.creator?.followers, post.creator?._id];
    const clients = users.filter((usr) => ids.includes(usr.userId));
    clients?.map((client) => {
      socket.to(client.socketId).emit("like-comment");
    });
  });
  socket.on("create-comment", ([post, myInfo]) => {
    const ids = [...post.creator?.followers, post.creator?._id];
    const clients = users.filter((usr) => ids.includes(usr.userId));
    clients?.map((client) => {
      socket.to(client.socketId).emit("create-comment");
      socket
        .to(client.socketId)
        .emit("notification", `${myInfo.name} created  comment`);
    });
  });
  socket.on("edit-comment", ([post, myInfo]) => {
    const ids = [...post.creator?.followers, post.creator?._id];
    const clients = users.filter((usr) => ids.includes(usr.userId));
    clients?.map((client) => {
      socket.to(client.socketId).emit("edit-comment");
      socket
        .to(client.socketId)
        .emit("notification", `${myInfo.name} Edited own comment`);
    });
  });
  socket.on("follow-unfollow", ([client, myInfo, message]) => {
    const user = users?.find(
      (usr) => usr.userId.toString() === client.toString()
    );

    const addMessage =
      message === "follow" ? "start Following You" : "UnFollow You";
    socket
      .to(user.socketId)
      .emit("notification", `${myInfo.name} ${addMessage} `);
  });
  socket.on("delete-comment", ([post, myInfo]) => {
    const ids = [...post.creator?.followers, post.creator?._id];
    const clients = users.filter((usr) => ids.includes(usr.userId));
    clients?.map((client) => {
      socket.to(client.socketId).emit("delete-comment");
      socket
        .to(client.socketId)
        .emit("notification", `${myInfo.name} deleted own comment`);
    });
  });
  socket.on("message-send", (message) => {
    const user = users?.find(
      (usr) => usr.userId.toString() === message.reciever._id.toString()
    );
    socket.to(user?.socketId).emit("recieve-message", message);
  });
});
console.log(users);
const port = process.env.PORT || 5000;
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", UserRoutes);
app.use("/posts", PostRoutes);
app.use("/messages", MessageRoutes);
app.use(ErrorHandler);

server.listen(port, function () {
  console.log(`app running on port ${port}`);
  connectDB();
});
