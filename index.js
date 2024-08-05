const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 3000;

const app = express();

app.get('/', (req, res) => {
  res.send("<h1>Bonjour</h1>");
});


const httpServer = createServer(app);


const io = new Server(httpServer,{
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
    },
  }
);

io.on('connection', (socket) => {

    console.log('New user connected with ID : '+socket.id);
    socket.join('connected users');

    socket.on('online', (data) => {
      console.log('new user is online');

      io.to("connected users").except(socket.id).emit("user-connected", data["id"]);

    });

    socket.on('sent-friendship-request', (_) => {
      // console.log(_);
      io.to("connected users").except(socket.id).emit("friendship-request", _);
    });

    socket.on('accepted-friendship-request', (_) => {
      console.log(_);
      io.to("connected users").except(socket.id).emit("accept-friendship-request", _);
    });

    socket.on('message', (_) => {
      io.to("connected users").except(socket.id).emit("message", _);
    });

    socket.on('ask_to_play', (data) => {
      socket.join(data["roomID"]);
      io.to("connected users").except(socket.id).emit("playing-request", data);
      console.log(data);
    });

    socket.on('accept_to_play', (data) => {
      socket.join(data["roomID"]);
      io.to(data["roomID"]).except(socket.id).emit("accepted-playing-request", data);
    });

    socket.on('decline_to_play', (data) => {
      console.log(data);
      socket.join(data["roomID"]);
      io.to("connected users").except(socket.id).emit("declined-playing-request", data);
      io.to(data["roomID"]).except(socket.id).emit("declined-playing-request", data);
    });

    socket.on('quit_the_game', (data) => {
      console.log(data);
      socket.join(data["roomID"]);
      io.to("connected users").except(socket.id).emit("quited-the-game", data);
      io.to(data["roomID"]).except(socket.id).emit("quited-the-game", data);
    });

    socket.on('user-choosed-book', (data) => {
      console.log(data);
      io.to(data["roomID"]).except(socket.id).emit("choosed-book", data);
    });

    socket.on('user-finished-answer', (data) => {
      console.log(data);
      io.to(data["roomID"]).except(socket.id).emit("finished-answer", data);
    });

    socket.on('disconnect', (socket) => {
      console.log("User with ID : "+socket.id+ " disconnected");
    });

  });

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});