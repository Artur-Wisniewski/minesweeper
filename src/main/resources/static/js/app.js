var stompClient = null;
var currentSubscription;
var gameSubscription;
var username = null;
var roomId = null;
var topic = null;
var gameTopic = null;
var saper = true;
var bomber = true;

var States = {
    WAITING: 1,
    DEPLOYING: 2,
    DEFUSING: 3,
};
var currentState = States.WAITING;
//game
var ikonaFlagi = '<i class="fa fa-flag" aria-hidden="true"></i>';
var ikonaZnakuZapytania = '<i class="fa fa-question" aria-hidden="true"></i>';
var ikonaBomby = '<i class="fa fa-bomb" aria-hidden="true"></i>';
var obojetnaTwarz = '<i class="fa fa-meh-o" aria-hidden="true"></i>';
var szczesliwaTwarz = '<i class="fa fa-smile-o" aria-hidden="true"></i>';
var smutnaTwarz = '<i class="fa fa-frown-o" aria-hidden="true"></i>';
var boardSize = 18;
var boombsCounter = 0;

function initBoard(){

    $("#buzka").html(obojetnaTwarz);
    $("#licznikFlag").html(boombsCounter);
    $("#czasomierz").html(0);
    var zawartoscDiva="";
    for(var i = 0; i < boardSize * (boardSize-2); i++){
        zawartoscDiva = '<div id=element' + i + ' class="kafelek zasloniety kursor" style="width: 25px; height: 25px;" ></div>';

        if((i + 1) % boardSize == 0){
            zawartoscDiva += '<div style="clear:both;"></div>'
        }
        //console.log(zawartoscDiva);
        $("#plansza").append(zawartoscDiva);
    }
    addListeners();
}
function addListeners(){

    for (var i = 0; i < boardSize * (boardSize-2); i++) {


        var element = document.getElementById("element" + i);
        element.addEventListener('click', function (event){
            console.log("lewe klikniecie " + event.target.id);
            addBomb(event.target.id);
            event.preventDefault();
        }, false);
        element.addEventListener('contextmenu', function (event){
            console.log("prawe klikniecie " + event.target.id);
            event.preventDefault();
            clearField(event.target.id);
        }, false);
    }
}
function addBomb(id){
    var element = document.getElementById(id);
    element.innerHTML = ikonaFlagi;
}
function clearField(id){
    var element = document.getElementById(id);
    element.innerHTML = "";
}

msgInput = $('#message');
var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(){
    if( $('#room-id').val() == "" ||  $('#name').val() == "" )
    {
        preventDefault();
    }
    username = $("#name").val().trim();
    if (username) {
        $("#stage1").hide();
        $("#stage2").attr("class","");


        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
}
function onConnected() {
    enterRoom($("#room-id").val());
    $(".connecting").hide();
}

function onError(error) {
    $(".connecting").css("color","red");
    $(".connecting").text('Could not connect to WebSocket server. Please refresh this page to try again!');
}
function enterRoom(newRoomId) {
    initBoard();
    roomId = newRoomId;
    $("#room-id-display").text(roomId);
    topic = `/app/chat/${newRoomId}`;
    gameTopic = `/app/game/${newRoomId}`;
    if (currentSubscription || gameSubscription) {
        currentSubscription.unsubscribe();
        gameSubscription.unsubscribe();
    }
    currentSubscription = stompClient.subscribe(`/channel/${roomId}`, onMessageReceived);
    gameSubscription = stompClient.subscribe(`/game/${roomId}`, onGameMessageReceived);

    stompClient.send(`${topic}/addUser`, {}, JSON.stringify({sender: username, type: 'JOIN'}));
    stompClient.send(`${gameTopic}/joinToTheGame`, {}, JSON.stringify({sender: username, type: 'JOIN'}));
}
//do poprawienia wszyyyystko
function sendBOMBERRole() {
    sendRole("BOMBER");
}
function sendSAPERRole() {
    sendRole("SAPER");
}
function sendRole(roleToSend) {
    if (roleToSend && stompClient) {
        var RoleMessage = {
            sender: username,
            role: roleToSend,
        };
        stompClient.send(`${gameTopic}/sendRole`, {}, JSON.stringify(RoleMessage));
    }
}
function onGameMessageReceived(payload) {
    var gameMessage = JSON.parse(payload.body);
    console.log(gameMessage);
    if(gameMessage.bomber && bomber){
        showNotification(gameMessage.bomber + ": is BOMBER!")
        bomber = false;
        $( "#BOMBER" ).hide();
    }
    if(gameMessage.saper && saper){
        showNotification(gameMessage.saper + ": is SAPER!")
        $( "#SAPER" ).hide();
        saper = false;
    }
    if(gameMessage.state == 'DEPLOYING'){
        currentState = States.DEPLOYING;
        $("#role").append("<button type=\"submit\" id=\"COMMIT\" class=\"primary inline\">COMMIT</button> ");
    }
}
function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');
    if (message.type == 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type == 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    $('#messageArea').append(messageElement);
    $('#messageArea').scrollTop($('#messageArea').prop('scrollHeight'));
}
function showNotification(notification){
    var messageElement = document.createElement('li');
    messageElement.classList.add('event-message');
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(notification);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    $('#messageArea').append(messageElement);
    $('#messageArea').scrollTop($('#messageArea').prop('scrollHeight'));
}
function sendMessage() {
    var messageContent = $('#message').val().trim();
    if (messageContent.startsWith('/join ')) {
        var newRoomId = messageContent.substring('/join '.length);
        enterRoom(newRoomId);
        $('#messageArea').empty();

    } else if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };
        stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));
    }
    $('#message').val( '');
}
function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}
$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#join" ).click(function() { connect(); });
    $("#send").click(function () {  sendMessage()});
    $( "#BOMBER" ).click(function() { sendBOMBERRole(); });
    $("#SAPER").click(function () {  sendSAPERRole()});

});
