const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors')
const fs = require('fs')
const { ExpressPeerServer } = require('peer')

const SocketIO = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

const peerServer = ExpressPeerServer(http)

var users = []

app.use(cors())
app.use(express.static('emoji'))
app.use('/peerjs', peerServer)

SocketIO.on('connection', (socket) => {

  socket.on('disconnect', () => {
    users = users.filter((user) => user.id !== socket.id)
  })


  socket.on('join-lobby', (name, id) => {
    users.push({ name: name, id: id })
    socket.emit('join-lobby', name, id)
  })

  socket.on('get-current-users', cb => {
    cb(users)
  })

  socket.on('send-message', (message, username, userid, to) => {
    if (to === "Multi")
      socket.to("Multiplayer").emit('receive-message', message, username, userid, "Multiplayer")
    else if (to !== undefined)
      socket.to(to).emit('receive-message', message, username, userid, "One")
  })

  socket.on('send-image', (image, sendername, senderid, to) => {
    if (to === "Multi")
      socket.to("Multiplayer").emit('receive-image', image, sendername, senderid, "Multiplayer")
    else if (to !== undefined)
      socket.to(to).emit('receive-image', image, sendername, senderid, "One")
  })

  socket.on('join-chat', (username, userid, to) => {
    if (to === "Multi")
      socket.to("Multiplayer").emit('join-chat', username, userid, "Multiplayer")
    else if (to !== undefined) {
      socket.to(to).emit('join-chat', username, userid, "One")
    }
  })

  socket.on('leave-chat', (username, userid, to) => {
    if (to === "Multi")
      socket.to("Multiplayer").emit('leave-chat', username, userid, "Multiplayer")
    else if (to !== undefined)
      socket.to(to).emit('leave-chat', username, userid, "One")
  })

  socket.on('join-multiplayer-chat', (room) => {
    socket.join(room)
  })

  socket.on('leave-multiplayer-chat', (room) => {
    socket.leave(room)
  })

})

app.get('/test', (req, res) => {
  res.json({
    message: "hello world"
  })
})


app.get('/emoji', (req, res) => {
  fs.readdir('emoji', (err, files) => {
    res.json({
      file: files
    })
  })
})

const server = http.listen(4000, () => {
  console.log('listening on *:4000');
});
