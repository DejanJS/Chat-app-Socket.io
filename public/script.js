$(function () {
	var socket = io();
	var username;
	var password;
	var currSocket;
	$('html > * :not(.centered):not(#name):not(.sub):not(.bar):not(.lab):not(.group):not(.group2)').css("opacity", 0.2);

	//[{"id":2,"username":"will","text":"did i insert","timestamp":"2018-09-08T12:47:33.761Z"},{"id":3,"username":"steve","text":"deadeaddead","timestamp":"2018-09-08T13:06:59.438Z"}]//
	$.get('/svc/messages', (data) => {
		data.map((msg) => {
			writeMessage(msg.username, msg.text);
		})
	})
	$.get('/svc/curruser', function (data) {
		currSocket = data.id;
	})
	$('.sub').click(function () {
		username = $('#name').val();
		password = $('#password').val();
		$.post('http://localhost:3000/user/entry', { name: username, pass: password, id: currSocket }, function (data) {
			console.log("this is msg : ", data.message);
		});
		console.log("this is user ", $('#name').val());
		$('.centered').remove();
		$('*').css("opacity", 1);
		$('#m').removeAttr("disabled");
		$('#messages').css("display", "block")
	})

	$('.send').click(function () {
		if ($('.centered').length <= 0) {
			socket.emit('chat message', { msg: $('#m').val(), user: username });
			$('#m').val('');
		}
		return false;

	})
	$('#m').keyup(function (e) {
		if (e.which === 13) {
			socket.emit("chat message", { msg: $(this).val(), user: username });
			$(this).val('')
		}
	})
	socket.on("chat message", function (msg) {
		writeMessage(msg.user, msg.msg);
	})


	//user is typing...
	function Typing(id){
		socket.emit('isTyping',{
			from:currSocket,
			to: id
		});
		if (true) { // small typing hack
			setTimeout(function () {
				socket.emit("notyping", {
					from:currSocket,
					to: id
				})
			}, 2000)
		}
	}

	function Whisper(id, userMsg) {
		socket.emit("toUser", {
			id: id,
			print: userMsg,
			from: currSocket,
			fromUser: username
		})
	}
	socket.on("isTyping", function (data) {
		$('.loader').css("display", "flex");
		console.log("is typing : ",data)
	})
	socket.on("notyping", function (data) {
		$('.loader').css("display", "none");
		console.log("not typing : ",data)
	})

	//render list on connection
	socket.on("User connected", function (data) {
		$('.ulist').html('');
		data.users.map((user) => {
			$('.ulist').append(`<li data=${user.id}>${user.uname}</li>`);
		})
		openChat()
		console.log("user list array : ", data);
	})

	//render list on disconnection
	socket.on("user disconnected", function (data) {
		$('.ulist').html('');
		data.users.map((user) => {
			$('.ulist').append(`<li data=${user.id}>${user.uname}</li>`);
		})
		openChat()
	})
	//receiver
	socket.on("toUser", data => {
		console.log("received data from user", data);
		//check if there is already opened chat ,if not pop it up to the user with the message;
		if ($(`.container[data=${data.from}]`).length === 0) {
			$('.fixedcont').append(`<div class="container" data=${data.from} >
					 <header class="header" data=${data.from}>
						 <span class="usernamex" data=${data.from}>${data.username}</span>
						 <button class="close">X</button>
					 </header>
					 <section class="chatwindow" data=${data.from}>
					<div class="box2">
						<h1>${data.username}</h1>
						<p>${data.message}</p>	 
					</div>
					<div class="loader">
						<div class="circle"></div>
						<div class="circle"></div>
						<div class="circle"></div>
					</div>   
					 </section>
					 <form class="chatin" onsubmit="return false;">
						 <input type="text" placeholder="enter message.." class="message" data=${data.from}>
						 <button class="subx" data=${data.from}>
							 <svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="rgba(0,0,0,.38)" d="M17,12L12,17V14H8V10H12V7L17,12M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z" /></svg>	
						 </button>
					 </form>
					 </div>`)
					 

		} else {
			console.log("this is else statement, i am firing? ",data.message , "ako je veci od 0 ima boxa ",$(`.container[data=${data.from}]`).length)
			//if there is already opened chat window just add the message to the chat window
			$(`.chatwindow[data=${data.from}]`).append(` <div class="box2">
					<h1>${data.username}</h1>
					<p>${data.message}</p>
					
				  </div>`)
		}
		$(`.message[data=${data.from}]`).on("keyup", function (e) {
			Typing(data.from)
			buttonState(this);
		});
			 UIrender(data.from);
	})

//button enable/disable
	function buttonState(button) {
		if ($(button).val() == '') {
			console.log("button off")
			$(button).removeAttr('good');
		}
		else {
			console.log("button on")
			$(button).attr('good', '');
		}
	}

	function openChat() { // test = socketid / currsocket
		$('.ulist > li').click(function (e) { //clicking on list of users
			var toWho = $(this).text();
			uid = e.target.getAttribute('data'); //target socket id of the user that we want to send the message
			console.log("hmm?", currSocket)
			if (uid === currSocket) { //prevent from clicking on yourself
				return false;
			}
			console.log("sending to ", uid)
			var eh;
			var arr = $('.fixedcont > .container');
			arr.each(function () {
				if ($(this).attr("data") === uid) {
					eh = true;
					return;
				}
			})
			if (eh) {
				return false;
			}
			$('.fixedcont').append(`<div class="container" data=${uid} >
					<header class="header" data=${uid}>
						<span class="usernamex" data=${uid}>${toWho}</span>
						<button class="close">X</button>
					</header>
					<section class="chatwindow" data=${uid}>
						<div class="loader">
							<div class="circle"></div>
							<div class="circle"></div>
							<div class="circle"></div>
						</div>   
					</section>
					<form class="chatin" onsubmit="return false;">
						<input type="text" placeholder="enter message.." class="message" data=${uid}>
						<button class="subx" data=${uid}>
							<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="rgba(0,0,0,.38)" d="M17,12L12,17V14H8V10H12V7L17,12M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z" /></svg>	
						</button>
					</form>
					</div>`)
			// adding chatbox animation
			$(`.message[data=${uid}]`).on("keyup", function (e) {
				// console.log("keyup",e.keyCode)
				Typing(uid)
				buttonState(this);
				
			});
				UIrender(uid)
		})
	}


	function UIrender(id){
		// _minimize the chatbox animation
		$(`.header[data=${id}], .usernamex[data=${id}]`).click(function (e) {
			e.stopPropagation();
			let data = e.target.parentElement.getAttribute('data');
			let dflag = $(".container[data='" + data + "']").attr("data-flag");
			console.log("dflag ?", dflag)
			if (!dflag || dflag === "false") {
				$(".container[data='" + data + "']").height("45px");
				$(".container[data='" + data + "']").width("200px")
				dflag = $(".container[data='" + data + "']").attr("data-flag", "true").attr("data-flag");
			} else {
				$(".container[data='" + data + "']").height("400px");
				$(".container[data='" + data + "']").width("400px");
				dflag = $(".container[data='" + data + "']").attr("data-flag", "false").attr("data-flag");
			}
		})
		// close the chatbox
		$(`.close`).click(function (e) {
			let closing = e.target.parentElement.getAttribute("data");
			$(`.container[data=${closing}]`).remove();
		})

		// send message on click to the user
		$(`.subx[data=${id}]`).unbind('click').click(function (e) { 
			e.stopPropagation();
			console.log("sending to user", id)
			let msg = $(`.message[data=${id}]`).val();
			console.log("this is message that is being sent ",msg);
			Whisper(id, msg);
			$(`.chatwindow[data=${id}]`).append(` <div class="box1">
					<h1>${username}</h1>
					<p>${msg}</p>
				  </div>`)
				  $(`.message[data=${id}]`).val('')
			 	buttonState(`.message[data=${id}]`)
	})
}

})
function writeMessage(user, msg) {
	$('#messages').append($('<li>').text(user + " : " + msg));
}