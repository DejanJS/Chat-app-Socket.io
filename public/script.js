	$(function(){
		var socket = io();
		var username;
	$('html > * :not(.centered):not(#name):not(.sub):not(.bar):not(.lab):not(.group):not(.group2').css("opacity",0.2)
	$('.sub').click(function(){
		// window.location.href.split('#')[0]
		username = $('#name').val();
		console.log("this is user ",$('#name').val());
		$('.centered').remove();
		$('*').css("opacity",1);
		$('#m').removeAttr("disabled");
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
				$('#messages').append($('<li>').text(msg.user + " : " + msg.msg));
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