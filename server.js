const http = require("http");
const host = "localhost";
const express = require("express");
const app = express();
const body = require("body-parser");
const port = process.env.PORT || 3000;
const server = http.createServer(app)
const socket = require("socket.io");
const io = socket();
var pgp = require('pg-promise')();
var db = pgp('postgres://postgres:grimftw@localhost:5432/Chat');
const crypto = require("crypto");
function crypting(pass,alg="sha256",secret ="this is my secret",salt = "asjdkluhjsio8djkasn"){
	return crypto.createHmac(alg,secret).update(`${salt}-${pass}`).digest("hex");
}

var users = 0;

// db.one('SELECT username FROM History')
//   .then(function (data) {
//     console.log('DATA:', data.username)
//   })
//   .catch(function (error) {
//     console.log('ERROR:', error)
//   })
async function getUser(){
	var data = await db.one('SELECT username FROM History'); // bob
	console.log(data.username); // bob 
};

getUser();
// async function printUser(){
// console.log("am i getting data : ",await getUser());	
// }
// printUser();

// db.none('INSERT INTO History(username) VALUES($1)',["Steven"])
// .then(()=>{
// 	console.log("added something")
// })
// .catch(err =>{
// 	console.log("there was an err",err)
// })


io.listen(server);

server.listen(port,function(){
	console.log("Starting on this port",port)
});

app.use("/public",express.static('public'));

// io.to('games').on("connection",function(socket){
// 	socket.on("joininggame",()=>{

// 	})
// })


io.on('connection', function(socket){
	users++;
  console.log(`a user connected\nnumber of users : ${users}`);
  console.log("Loopback : ", socket.handshake.address)
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

