const http = require("http");
const host = "localhost";
const express = require("express");
const app = express();
const body = require("body-parser");
const port = process.env.PORT || 3000;
const server = http.createServer(app)
const socket = require("socket.io");
const io = socket();

var users = 0;


io.listen(server);

server.listen(port,function(){
	console.log("Starting on this port",port)
});

app.use("/public",express.static('public'));

io.on('connection', function(socket){
	users++;
  console.log(`a user connected\nnumber of users : ${users}`);
  socket.on('disconnect',()=>{
	  users--;
	  console.log(`user disconnected\nnumber of users : ${users}`)
  })
  socket.on('chat message', function(msg){
    console.log('message: ' + msg.msg);
	io.emit("chat message",msg);
  })
  socket.on("typing",function(data){
  	socket.broadcast.emit('typing',data)
  })
  socket.on("notyping",function(empty){
  	socket.broadcast.emit("notyping",empty)
  })
});



app.use(body.json())
app.use(body.urlencoded({
	extended : true
}))



 app.get("/",function(req,res){
 	res.sendFile(__dirname + "/public/index.html");
 })

