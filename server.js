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

 server.listen(port,()=>{
	console.log("this is portname",port);
}) 
io.listen(server);

io.on('connection', function(socket){
	users++;
  console.log(`a user connected\nnumber of users : ${users}`);
  socket.on('disconnect',()=>{
	  users--;
	  console.log(`user disconnected\nnumber of users : ${users}`)
  })
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  })
});

app.use(body.json())
app.use(body.urlencoded({
	extended : true
}))



app.get("/",function(req,res){
	res.sendFile(__dirname + "/index.html");
})

