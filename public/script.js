	function writeMessage(user,msg){
		$('#messages').append($('<li>').text(user + " : " + msg));
	}
	$(function(){
		var socket = io();
		var username;
		var password;
	$('html > * :not(.centered):not(#name):not(.sub):not(.bar):not(.lab):not(.group):not(.group2)').css("opacity",0.2);
	
	//[{"id":2,"username":"will","text":"did i insert","timestamp":"2018-09-08T12:47:33.761Z"},{"id":3,"username":"steve","text":"deadeaddead","timestamp":"2018-09-08T13:06:59.438Z"}]//
	 $.get('/svc/messages',(data)=>{
	 	data.map((msg)=>{
			writeMessage(msg.username,msg.text);
		 })
	 })
	$('.sub').click(function(){
		username = $('#name').val();
		password = $('#password').val();
		$.post('http://localhost:3000/user/entry',{name:username , pass : password},function(data){
			console.log("this is msg : ",data.message);
		});
		console.log("this is user ",$('#name').val());
		$('.centered').remove();
		$('*').css("opacity",1);
		$('#m').removeAttr("disabled");
		$('#messages').css("display","block")
	})

	$('.send').click(function(){
		if($('.centered').length <= 0){
		socket.emit('chat message',{ msg : $('#m').val(), user : username});
			$('#m').val('');
		}
		return false;
		
	})
		$('#m').keyup(function(e){
			if(e.which === 13){
			socket.emit("chat message",{ msg : $(this).val(), user : username});
				$(this).val('')
			}
		})
			socket.on("chat message",function(msg){
				$('.loader').css("display","none");
				$('.type').text('');
				// $('#messages').append($('<li>').text(msg.user + " : " + msg.msg));
				writeMessage(msg.user,msg.msg);
		 	})

		 	$("#m").on("input",function(){
		 		socket.emit("typing",username);
		 		if(true){ // small typing hack
			 		setTimeout(function(){
			 			socket.emit("notyping",'')	
			 		},2000)	
		 		}		 		
		 	})

		 	socket.on("typing",function(data){
		 		$('.loader').css("display","inline-block");
		 		$('.type').html("<em>" + data + " is typing..." + "</em>")
		 	})
		 	socket.on("notyping",function(empty){
		 			$('.loader').css("display","none");	 		
		 			$('.type').text(empty);		 				 		
		 	})		
	})