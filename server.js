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

async function getUser(){
	try{
		var data = await db.any('SELECT username FROM History');
		data.map((usr,i)=>{
			console.log(usr.username)
		})		
	} catch(e){
		console.log("there was an error : ",e);
	}
};

getUser();

io.listen(server);
server.listen(port, function () {
	console.log("Starting on this port", port)
});

app.use("/public", express.static('public'));

// io.to('games').on("connection",function(socket){
// 	socket.on("joininggame",()=>{

io.on('connection', function (socket) {
	users++;
	console.log(`a user connected\nnumber of users : ${users}`);
	console.log("Loopback : ", socket.handshake.address)
	socket.on('disconnect', () => {
		users--;
		console.log(`user disconnected\nnumber of users : ${users}`)
	})
	socket.on('chat message', function (msg) {
		console.log('message: ' + msg.msg);
		io.emit("chat message", msg);
	})
	socket.on("typing", function (data) {
		socket.broadcast.emit('typing', data)
	})
	socket.on("notyping", function (empty) {
		socket.broadcast.emit("notyping", empty)
	})
});

app.use(body.json())
app.use(body.urlencoded({
	extended: true
}))

// CORS
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
	next();
  });

  //post route
app.post('/user/entry',function(req,res){
	db.one('SELECT NULLIF(MAX(ID)+1,1) as NewId FROM History')
		.then(data => {
			db.none('INSERT INTO History(id,username,pass) VALUES($1,$2,$3)', [data.newid, req.body.name, req.body.pass])
				.then(() => {
					res.status(200).json({
						message: "Succesfully registred!"
					})
				})
				.catch(() => {
					res.status(404).json({
						message: "Sorry something went wrong."
					})
				})
		});
	})

 app.get("/",function(req,res){
 	res.sendFile(__dirname + "/public/index.html");
 })

