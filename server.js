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
	if(await UserExists(name)){
		if(await AuthUser(name,pass)){
			res.status(200).json({
				message:"Successfully logged in"
			})
		} else{
			res.status(401).json({
				message:"bad user/pass...try again!"
			})
		}
	} else if(await InsertUser(name,pass)){
		res.status(200).json({
			message:"Successfully registred"
		})
	} else{
		res.status(500).json({
			message:"who knows what happened ?"
		})
	}
})

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
})

// function crypting(pass,alg="sha256",secret ="this is my secret",salt = "asjdkluhjsio8djkasn"){
// 	return crypto.createHmac(alg,secret).update(`${salt}-${pass}`).digest("hex");
// }
function crypt(pass,salt,iteration = 100000,keylen = 64,alg="sha256"){
	return crypto.pbkdf2Sync(pass,Buffer.from(salt),iteration,keylen,alg).toString('hex');
}
function salt() {
	let number = crypto.randomBytes(16);
	let token = number.toString('hex');
	return token;
}

var users = 0;

async function getUser() {
	try {
		var data = await db.any('SELECT username FROM Users');
		data.map((usr, i) => {
			console.log(usr.username)
		})
	} catch(e) {
		console.log("there was an error : ", e);
	}
};

getUser();

async function InsertUser(name, pass) {
	console.log("insert ",name,pass);
	var token = salt();
	var hashpass = crypt(pass,token);
	var data = await db.one('SELECT COALESCE(MAX(ID)+1,1) as NewId FROM Users');
	try {
		await db.none("INSERT INTO Users(id,username,pass,salt) VALUES($1,$2,$3,$4)", [data.newid, name, hashpass,token]);
		// res.status(200).json({
		// 	message: "Successfully registred!"
		// })
		return true;
	} catch(e) {
		// res.status(500).json({
		// 	message: "Sorry something went wrong."
		// })
		console.log("this is errrorr ",e);
		return false;
	}
}



async function UserExists(name) {
	console.log("exist ",name);
	var count = await db.one('SELECT COUNT(1) as Counter FROM Users WHERE Users.username = $1',name);
	console.log("count ",count)
	if (Number(count.counter) !== 0) {
		return true;
	}
	return false;
}

async function AuthUser(name, pass) {
	console.log('auth ',name,pass);
	var auth = await db.one('SELECT Salt,pass FROM USERS WHERE username = $1',name);
	var hashpass = crypt(pass,auth.salt);
	console.log("this is i am looking for ",auth.pass,hashpass);
	if(auth.pass.trim() === hashpass){
		return true;
	}
	return false;
}


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