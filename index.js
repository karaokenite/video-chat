const express = require("express");
const socket = require("socket.io");
const app = express();

// Starts the server:

let server = app.listen(4000, function () {
  console.log("Server is running");
});

app.use(express.static("public"));

// Upgrades the server to accept websockets:

let io = socket(server);

// Triggered when a client is connected:

io.on("connection", function (socket) {
  console.log("User Connected :" + socket.id);

  // Triggered when a peer hits the join room button:

  socket.on("join", function (roomName) {

    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(roomName);

    // room == undefined when no such room exists
    if (room == undefined) {
      socket.join(roomName);
      console.log("Room Created");
      socket.emit("created");
    } else if (room.size == 1) {
      socket.join(roomName);
      console.log("Room Joined");
      socket.emit("joined");
    } else {
      socket.emit("full");
      console.log("Room Full for Now");
    }
    
    console.log(rooms);

  });

  // Triggered when the person who joined the room is ready to communicate:

  socket.on("ready", function(roomName) {
    console.log("Ready");
    socket.broadcast.to(roomName).emit("ready"); // Informs the other peer in the room
  });

  // Triggered when servers gets an icecandidate from a peer in the room:
  
  socket.on("candidate", function(candidate, roomName) {
    console.log("Candidate");
    console.log(candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate); // Sends Candidate to the other peer in the room
  });

  // Triggered when server gets an offer from a peer in the room:
  
  socket.on("offer", function(offer, roomName) {
    console.log("Offer");
    console.log(offer);
    socket.broadcast.to(roomName).emit("offer", offer); // Send Offer to the other peer in the room
  });

  // Triggered when server gets an answer from a peer in the room:

  socket.on("answer", function(answer, roomName) {
    console.log("Answer");
    socket.broadcast.to(roomName).emit("answer", answer); // Sends Answer to the other peer in the room
  });
    
});