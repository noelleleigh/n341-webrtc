// WebRTC Demo for CSCI-N341
// by Noah Leigh
// 
// Uses the new WebRTC Web API to allow peer-tp-peer two-way video and simple text chat without the use of plugins.
// Works best with the latest version of Google Chrome.
// Uses the SimpleWebRTC library (https://github.com/andyet/SimpleWebRTC) as wrapper around the WebRTC framework.
// Supports multiple rooms, uses Peer-to-Peer connections to actually stream video, so very little load is placed on the server itself.

// The room to be joined is prompted at page load.
var room = new String();
// Sound from http://www.freesound.org/people/FoolBoyMedia/sounds/234524/
var ding = document.createElement("audio");
ding.setAttribute("src", "234524__foolboymedia__notification-up-1.wav");
ding.load();

// SimpleWebRTC boilerplate
var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: "localVideo",
    // the id/element dom element that will hold remote videos
    remoteVideosEl: "remoteVideos",
    // immediately ask for camera access
    autoRequestMedia: true,
    adjustPeerVolume: false,
    debug: false
});
// we have to wait until it's ready
webrtc.on("connectionReady", function () {
    webrtc.startLocalVideo();
    if (room) {
        webrtc.joinRoom(room);
        $("#info").html("Room name (share with other person to join you): <strong>"+room+"</strong>");
    } 
});

// Handler for recieving chat messages.
webrtc.on('channelMessage', function (peer, label, data) {
    // Only handle messages from your dataChannel
    if (label !== 'text chat') return;
    else if (data.type == 'chat') {
        console.log('Received message: ' + data.payload + ' from ' + peer.id);
        // Append the recieved text to our conversation history.
        $("<p class='remote'>"+data.payload+"</p>").appendTo("output");
        // Play sound
        ding.setAttribute("src", "234524__foolboymedia__notification-up-1.wav");
        ding.play();
    }
});

// Code from http://code.seebz.net/p/autolink-js/
// Finds URLs in chat text and converts them to clickable links in the history.
function autolink(str, attributes){
	attributes = attributes || {};
	var attrs = "";
	for(name in attributes)
		attrs += " "+ name +'="'+ attributes[name] +'"';
	
	var reg = new RegExp("(\\s?)((http|https|ftp)://[^\\s<]+[^\\s<\.)])", "gim");
	str = str.toString().replace(reg, '$1<a href="$2"'+ attrs +'>$2</a>');
	
	return str;
}


$(document).ready(function(){
    // Disclaimer :(
    $("<p><em>Note: If you're using Chrome, the first message you send won't be delivered. :( Sorry. </em></p>").appendTo("output");
    // Choose or create a room.
    room = prompt("Create/Join a room:", "room");
    // Chat sumbission handler
    $("#input").submit(function(event){
        // Get text from input
        var text = $('#text').val();
        // Create links from found URL's in string.
        text = autolink(text, {"target":"_blank"})
        // Send to partner through RTCDataChannel
        webrtc.sendDirectlyToAll("text chat", "chat", text);
        // Locally append the sent message to our conversation history.
        $("<p class='local'>"+text+"</p>").appendTo("output");
        // Empty the input.
        $('#text').val("")
        // Don't refresh the page.
        event.preventDefault();
    });
});