import http from "node:http"
import path from "node:path"
import url from "node:url"
import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import * as utils from "./utils.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEBAPP = path.join(__dirname, "..", "webapp");
const PORT = process.env.PORT || 3000

console.log("WEBAPP:", WEBAPP);

// APP 

// app is the express object that handles http requests.
// it is just a fancy way of constructing a function that
// takes (req, res) to use res to answer to req.
const app = express()

// Middleware: wrappers that preprocess requests

app.use(cors())
app.use(express.static(WEBAPP))

// Routes

app.get("/r/:roomId", (req, res) => {
  res.sendFile(path.join(WEBAPP, "index.html"))
})

// SERVER:

// http.createServer(...) takes a callable object with signature (req, res)
// in input and outputs the server that actually deals with the requests
// using that function. app is cleverly built using the flexibility of js,
// in fact you can call app.get and app.use but app is also callable and
// all that http.createServer(...) sees is that app is a function: 
//  * typeof app == "function"
//  * typeof (app.get) == "function"
// Clearly express was written keeping the compatibility with the http
// (which is part of the standard library) in mind.
const server = http.createServer(app)

// WEBSOCKETS

const io = new Server(server, { cors: { origin: "*" } })
let rooms = new Map() // (key: room id, value: Set of peers ids)

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`)
  let userRoomId = null
  const getUserRoomId = () => {
    // The returned room Id is guaranteed to exists in rooms and
    // the corresponding room is guaranteed to be the unique room
    // with this socket.id inside.
    userRoomId = utils.smartGetUserRoom(io, rooms, userRoomId, socket.id)
    return userRoomId
  }

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`)
    rooms.forEach((room, roomId) => {
      room.delete(socket.id);
      if (room.size === 0) { 
        rooms.delete(roomId); 
        console.log(`Room ${roomId} closed`)
      } else {
        utils.notifyPeersCountChange(io, room)
      }
    });
    userRoomId = null
  })
  
  socket.on("create-room", (callback) => {
    if (getUserRoomId() !== null) return callback({ok: false, error: `Cannot create room ${roomId} because creating requires joining and one user can join at most one room.`})

    let roomId = utils.findFreeRoomId(rooms)
    rooms.set(roomId, new Set([socket.id]))
    userRoomId = roomId
    console.log(`User ${socket.id} created room ${roomId}`)
    callback({ok: true, roomId: roomId})
  })

  socket.on("join-room", (roomId, callback) => {
    if (getUserRoomId() !== null) return callback({ok: false, error: `Cannot join room ${roomId} because one user can join at most one room.`})

    const room = rooms.get(roomId)
    if (room) {
      // Add peer to room
      room.add(socket.id)
      userRoomId = roomId
      utils.notifyPeersCountChange(io, room)
      console.log(`User ${socket.id} joined room ${roomId}`)
      return callback({ok: true})
    } else {
      userRoomId = null
      return callback({ok: false, error: `Cannot join room ${roomId} because it does not exist`})
    }
  })

  socket.on("send-to-peers", (msg, callback) => {
    let room = rooms.get(getUserRoomId())
    if (room) {
      room.forEach(peerId => {
        if (peerId !== socket.id) io.to(peerId).emit("peer-message", msg)
      })
      return callback({ok: true})
    }
    return callback({ok: false, error: `Cannot message the other peers because user ${socket.id} is not part of any room.`})
  })

})

// RUNNING THE SERVER

server.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`)
})