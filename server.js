const Message = require('./message.js')
const User = require('./user.js')
const http = require("http");
const host = "localhost";
const express = require("express");
const app = express();
const body = require("body-parser");
const port = process.env.PORT || 3000;
const server = http.createServer(app)
const socket = require("socket.io");
const io = socket();



io.listen(server);
server.listen(port, function () {
	console.log("Starting on this port", port)
});

app.use("/public", express.static('public'));

app.use(body.json())
app.use(body.urlencoded({
	extended: true
}))

// CORS
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
	next();
});

//post route
app.post('/user/entry',async function (req, res) {
	let name = req.body.name;
	let pass = req.body.pass;
	let sockid = req.body.id;
	let obj = {uname: name,id:sockid};
	try{
		if(!await User.exists(name)){
			await User.insert(name,pass)
			? userOnlineResponse(obj,"Successfully registred",res)
			: msgResponse(500,"who knows what happened ?",res)
			return;
		}
		await User.auth(name,pass)
		? userOnlineResponse(obj,"Successfully logged in",res)
		:msgResponse(401,"bad user/pass...try again!",res)
	} catch(e){
		objResponse(500,{
			message: "Some error occured",
			error : e
		},res)
	}
})



app.get("/", function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
})

app.get('/svc/userslist',function(req,res){
	res.send(userSocket);
})



app.get('/svc/curruser',function(req,res){
	res.status(200).json({
		id : currUser
	})
})

app.get("/svc/messages", async function (req, res) {
	try {
		res.status(200).json(
			await Message.get()
		)
	} catch (e) {
		res.status(500).json({
			message: "there was some error..",
			error: e
		})
	}
})

var users = 0;

User.printAll();

var userSocket = [];
var currUser;

//specific responder for userlogin event
function userOnlineResponse(connectInfo,msg,res){
	userSocket.push(connectInfo);
	io.local.emit('User connected',{users:userSocket})
	msgResponse(200,msg,res)
}
// Standard message responder
function msgResponse(statuscode,msg,res){
	objResponse(statuscode,{message:msg},res)
}
// Server respond
function objResponse(statuscode,obj,res){
	res.status(statuscode).json(obj)
	
}

io.on('connection', function (socket) {
	users++;
	currUser = socket.id;
	console.log(`a user connected\nnumber of users : ${users}`);
	console.log("Loopback : ", socket.handshake.address)
	socket.on('disconnect', () => {
		users--;
		userSocket = userSocket.filter(us => us.id !== socket.id);
		io.local.emit("user disconnected",{users:userSocket})
		console.log(`user disconnected\nnumber of users : ${users}`)
	})
	socket.on('chat message', async function (data) {
		console.log('data: ', data);
		io.emit("chat message", data);
		try {
			await Message.insert(data.user, data.msg);
		} catch (e) {
			console.log("inserting message didn't go well.. ", e)
		}

	})

	socket.on("notyping", function (data) {
		io.to(data.to + "").emit('notyping',{fromUser:data.from})
	})
	socket.on('isTyping',function(data){
		io.to(data.to + "").emit('isTyping',{fromUser:data.from})
	})
	socket.on("toUser",data =>{
		console.log("we got a message",data)
		io.to(data.id + "").emit("toUser",{message : data.print,user:data.id,from:data.from,username:data.fromUser})
	})
});

