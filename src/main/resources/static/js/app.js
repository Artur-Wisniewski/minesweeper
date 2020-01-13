var stompClient = null;
var currentSubscription;
var gameSubscription;
var username = null;
var roomId = null;
var topic = null;
var gameTopic = null;
var ikonaFlagi = '<i class="fa fa-flag" aria-hidden="true"></i>';
var ikonaZnakuZapytania = '<i class="fa fa-question" aria-hidden="true"></i>';
var ikonaBomby = '<i class="fa fa-bomb" aria-hidden="true"></i>';
var obojetnaTwarz = '<i class="fa fa-meh-o" aria-hidden="true"></i>';
var szczesliwaTwarz = '<i class="fa fa-smile-o" aria-hidden="true"></i>';
var smutnaTwarz = '<i class="fa fa-frown-o" aria-hidden="true"></i>';
var States = {
    WAITING: 1,
    DEPLOYING: 2,
    DEFUSING: 3,
};
var Roles = {
    OBSERVER : 1,
    BOMBER: 2,
    SAPER: 3,

};
//game
var czasomierz;
var sekundy = 0;
var czasUplywa = false;
var saper = true;
var bomber = true;
var iknowBro = true;
var DeployingFirstTime = true;
var defusing = true;
var odkryto = {};
var myRole = Roles.OBSERVER;
var currentState = States.WAITING;
var boardSize = 18;
var boombsCounter = 0;
var flagCounter = 0;
var boardBombs = [];
var iloscOdkrytychPol = 0;
var board = [];
var visibleBoard = [];
function initRestart(){
    //first restart server
    let restart = {
        restart:true
    };
    stompClient.send(`${gameTopic}/restart`, {}, JSON.stringify(restart));
}
function restart(){
    //restart client
    saper = true;
    bomber = true;
    iknowBro = true;
    DeployingFirstTime = true;
    defusing = true;
    odkryto = {};
    myRole = Roles.OBSERVER;
    currentState = States.WAITING;
    boombsCounter = 0;
    flagCounter = 0;
    boardBombs = [];
    iloscOdkrytychPol = 0;
    board = [];
    visibleBoard = [];
    czasUplywa = false;
    sekundy = 0;
    clearBoard();
    initBoard();
    $("#RESTART").hide();
    $("#BOMBER").show();
    $("#BOMBER").prop("disabled",false);
    $("#SAPER").show();
    $("#SAPER").prop("disabled",false);
    $("#COMMIT").hide();
}
function czasieUplywaj(){
    if(sekundy < 9999){
        sekundy ++;
        document.getElementById("czasomierz").innerHTML = sekundy;
    }
}
function uruchomCzas(){
    czasUplywa = true;
    czasomierz = setInterval(czasieUplywaj, 1000);
}
function clearBoard() {
    for(var i = 0; i < boardSize * (boardSize-2); i++){
        let element = document.getElementById("element"+i);
        if(element!=null)
        element.remove();

    }
    let element = document.getElementById("plansza");
    element.innerHTML = "";

}
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
        visibleBoard[i] = 9;
    }

}
function addListeners(){

    for (var i = 0; i < boardSize * (boardSize-2); i++) {


        var element = document.getElementById("element" + i);
        element.addEventListener('click', bomberClickType);
        element.addEventListener('contextmenu', bomberContextMenuType);
    }
}
//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER
function unieruchomKafelek(i){
    var element = document.getElementById("element" + i);
    element.removeEventListener("click",saperClickType);
    element.removeEventListener("contextmenu", saperContextMenuType);
}
function addSaperListeners(){

    for (var i = 0; i < boardSize * (boardSize-2); i++) {
        var element = document.getElementById("element" + i);
        element.addEventListener('click', saperClickType);
        element.addEventListener('contextmenu', saperContextMenuType);
    }
}function saperContextMenuType(event) {
    console.log("prawe klikniecie " + event.target.id);
    event.preventDefault();
    oflaguj(event.target.id);
}

function saperClickType(event) {
    console.log("lewe klikniecie " + event.target.id);
    let element = document.getElementById(event.target.id);
    if(element.innerHTML !== ikonaFlagi && element.innerHTML !== ikonaZnakuZapytania){
        var out = event.target.id.replace(/\'/g, '').split(/(\d+)/).filter(Boolean);
        odkryj(out[1]);
        for(var i = 0; i < visibleBoard.length; i++){

            if(odkryto.hasOwnProperty(i)){ // jesli nie null
                if(board[i] != "B")
                    visibleBoard[i] = board[i];
                else
                    visibleBoard[i] = 12;//to jest doslownie znak bomby

            }else if (!odkryto.hasOwnProperty(i)){
                var e = document.getElementById("element"+i);

                if(e.innerHTML === "")//pusty zakryty tzw
                    visibleBoard[i] = 9; //pusty
                else if(e.innerHTML === ikonaZnakuZapytania)
                     visibleBoard[i] = 11; // ikonaZnakuZapytania
                else
                    visibleBoard[i] = 10; // flaga
            }

        }
        sendMove(visibleBoard);
    }
    event.preventDefault();
}
function sendFlagCounter(flag){
    let flagCounter = {
        flagCounter: flag,
    };
    console.log(JSON.stringify(flagCounter));
    stompClient.send(`${gameTopic}/sendFlagCounter`, {}, JSON.stringify(flagCounter));
}
function sendLost(){
    var lost = {
        win: false
    };
    console.log(JSON.stringify(lost));
    stompClient.send(`${gameTopic}/sendState`, {}, JSON.stringify(lost));
}
function sendWin(){
    var win = {
        win: true
    };
    console.log(JSON.stringify(flagCounter));
    stompClient.send(`${gameTopic}/sendState`, {}, JSON.stringify(win));
}
function odkryj(i){

    /*if(!czasUplywa){
        uruchomCzas();
    }*/




    var element = document.getElementById("element" + i);
    element.classList.remove('kursor');

    if(element.innerHTML === ikonaFlagi){
        flagCounter --;
        document.getElementById("licznikFlag").innerHTML = boombsCounter - flagCounter;
        sendFlagCounter(boombsCounter - flagCounter);

    }

    if(board[i] === "B"){
        odkryto[i] = true;
        element.innerHTML = ikonaBomby;
        element.style.backgroundColor = "red";
        element.classList.remove('zasloniety');
        skucha();
    }
    else if(board[i] === 0 && !odkryto.hasOwnProperty(i)){
        odkryto[i] = true;
        element.innerHTML = "";
        element.classList.add('odkryty');
        element.classList.remove('zasloniety');

        var y = Math.floor(i/18);
        var x = i % 18;
        if(x < boardSize && y < boardSize-2 && x >= 0 && y >= 0) {
            if (x - 1 >= 0) {
                odkryj(x - 1 + (y * 18));
            }
            if (x + 1 < boardSize) {
                odkryj(x + 1 + (y * 18));
            }
            if (y + 1 < boardSize - 2) {
                odkryj(x + ((y + 1) * 18));
            }
            if (y - 1 >= 0) {
                odkryj(x + ((y - 1) * 18));
            }
            if (y + 1 < boardSize - 2 && x - 1 >= 0) {
                odkryj(x - 1 + ((y + 1) * 18));
            }
            if (y - 1 >= 0 && x + 1 < boardSize) {
                odkryj(x + 1 + ((y - 1) * 18));
            }
            if (y + 1 < boardSize - 2 && x + 1 < boardSize) {
                odkryj(x + 1 + ((y + 1) * 18));
            }
            if (y - 1 >= 0 && x - 1 >= 0) {
                odkryj(x - 1 + ((y - 1) * 18));
            }
        }
        unieruchomKafelek(i);
        iloscOdkrytychPol++;
        czyWygrales();

    }
    else if(board[i] !== 0 && !odkryto.hasOwnProperty(i)){
        odkryto[i] = true;
        var number = board[i];
        var color = ["#0000FD","#017E00","#FE0001","#010180","#7F0300","#008180","#000000","#808080"];
        element.innerHTML = '<div style="color:'+color[board[i]]+ '">'+board[i]+'</div>';
        element.classList.add('odkryty');
        element.classList.remove('zasloniety');
        unieruchomKafelek(i);
        iloscOdkrytychPol++;
        czyWygrales();
    }
}
function skucha(){
    for (var i = 0; i < boardSize * (boardSize-2); i++) {
        if(board[i] === "B"){
            odkryto[i] = true;
            var element = document.getElementById("element" + i);
            element.innerHTML = ikonaBomby;
            element.style.backgroundColor="red";
            element.classList.remove('zasloniety');

        }
    }
    sendLost();
    unieruchomPlansze();
    document.getElementById("buzka").innerHTML = smutnaTwarz;

}
function oflaguj(i){

    /*if(!czasUplywa){
        uruchomCzas();
    }*/

    var element = document.getElementById(i);
    var out = i.replace(/\'/g, '').split(/(\d+)/).filter(Boolean);
    var index = out[1];
    if(element.innerHTML === ""){
        element.innerHTML = ikonaFlagi;
        visibleBoard[index] = 10;
        flagCounter++;
    }

    else if(element.innerHTML === ikonaFlagi){
        element.innerHTML = ikonaZnakuZapytania;
        visibleBoard[index] = 11;
            flagCounter--;
    }

    else{
        element.innerHTML = "";
        visibleBoard[index] = 9;
    }

    document.getElementById("licznikFlag").innerHTML = boombsCounter - flagCounter;
    sendFlagCounter(boombsCounter - flagCounter);
    czyWygrales();

    sendMove(visibleBoard);
}
function czyWygrales(){
    if(iloscOdkrytychPol + boombsCounter === board.length && flagCounter === boombsCounter ){
        unieruchomPlansze();
        document.getElementById("buzka").innerHTML = szczesliwaTwarz;
        sendWin();
    }

}
function unieruchomPlansze(){
    for (var i = 0; i < boardSize * (boardSize-2); i++) {
        if(!odkryto.hasOwnProperty(i)){
            //usuwa wszystkie listenersy dla elementu
            unieruchomKafelek(i);
        }
    }
    //clearInterval(czasomierz);
}
//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER//SAPER
//bomber//bomber//bomber//bomber//bomber//bomber//bomber//bomber//bomber//bomber//bomber//bomber//bomber
function bomberContextMenuType(event) {
    console.log("prawe klikniecie " + event.target.id);
    event.preventDefault();
    clearField(event.target.id);
}
function bomberClickType(event) {
    console.log("lewe klikniecie " + event.target.id);
    addBomb(event.target.id);
    event.preventDefault();
}
function removeListeners() {
    for (var i = 0; i < boardSize * (boardSize-2); i++) {
        var element = document.getElementById("element" + i);
        element.removeEventListener("click", bomberClickType);
        element.removeEventListener("contextmenu", bomberContextMenuType);
    }
}
function clearFields() {
    for(let i = 0; i < boardBombs.length; i++){
        var element = document.getElementById(boardBombs[i]);
        element.innerHTML = "";
    }
}
function addBomb(id){
    var element = document.getElementById(id);
    if(element.innerHTML==""){
        boombsCounter++;
        boardBombs.push(id);
        element.innerHTML = ikonaBomby;
        $("#licznikFlag").html(boombsCounter);
        sendFlagCounter(boombsCounter);


        }


}
function clearField(id){
    var element = document.getElementById(id);
    if(element.innerHTML!=""){
        boombsCounter--;
        for(var i = 0; i < boardBombs.length;i++){
            if(boardBombs[i] == id){
                boardBombs.splice(i,1);
                break;
            }
        }
        element.innerHTML = "";
        $("#licznikFlag").html(boombsCounter);
        sendFlagCounter(boombsCounter);
    }
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
    $("#SAPER").prop("disabled",true);
    myRole = Roles.BOMBER;
}
function sendSAPERRole() {
    sendRole("SAPER");
    $("#BOMBER").prop("disabled",true);
    myRole = Roles.SAPER;
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
function sendBoard() {
    var BoardMessage ={
        fields: processText(boardBombs),
    }
    console.log(JSON.stringify(BoardMessage));
    stompClient.send(`${gameTopic}/sendBoard`, {}, JSON.stringify(BoardMessage));
    $("#COMMIT").prop("disabled",true);
}
function sendMove(board) {
    var BoardMessage ={
        fields: board,
    }
    console.log(JSON.stringify(BoardMessage));
    stompClient.send(`${gameTopic}/sendMove`, {}, JSON.stringify(BoardMessage));
}
function processText(inputText) {
    var output = [];
    console.log(inputText);
    var text = ["element1","element2","element3"];
    console.log(text);
    var i = 0;
    var outputout =  [];
    inputText.forEach(function (item) {
        output.push(item.replace(/\'/g, '').split(/(\d+)/).filter(Boolean));
        outputout.push(output[i][1]);
        i++;
    });
    return outputout;
}
function onGameMessageReceived(payload) {
    var gameMessage = JSON.parse(payload.body);
    console.log(gameMessage);
    if(gameMessage.restart){
        showNotification("RESTART!");
        restart();
    }
    if(gameMessage.bomber && bomber){
        showNotification(gameMessage.bomber + ": is THE BOMBER!")
        bomber = false;

        $( "#BOMBER" ).hide();
    }
    if(gameMessage.saper && saper){
        showNotification(gameMessage.saper + ": is THE SAPER!")
        $( "#SAPER" ).hide();
        saper = false;
    }
    if(gameMessage.state == 'DEPLOYING'){
        if(DeployingFirstTime)
        showNotification(gameMessage.bomber + ": is DEPLOYING!")
        DeployingFirstTime=false;
        currentState = States.DEPLOYING;
        $("#COMMIT").attr("class","primary inline");
        $("#COMMIT").prop("disabled",false);
        $("#COMMIT").show();
        if(myRole != Roles.BOMBER)
            $("#COMMIT").hide();
        else
            addListeners();
        if(gameMessage.flagCounter!=null)
        $("#licznikFlag").text(gameMessage.flagCounter);
    }if(gameMessage.state == 'DEFUSING' && defusing){
        showNotification(gameMessage.saper + ": is DEFUSING!")
        if(!czasUplywa){
            uruchomCzas();
        }
        currentState = States.DEFUSING;
        if(myRole == Roles.SAPER){
            addSaperListeners();
            $("#RESTART").attr("class","primary inline");
            $("#RESTART").show();
        }
        else if(myRole == Roles.BOMBER){
            $("#COMMIT").hide();
            clearFields();
            removeListeners();
        }
        defusing = false;
        //tutaj jakis przycisk restartu i jakis warunek ze jak saper oddejdzie to trzeba restartowac
        boombsCounter = gameMessage.board.fields.length;
        $("#licznikFlag").text(boombsCounter);
        //to moze sie wykonac tylko raz
        setBoard(gameMessage.board.fields)
    }if(  gameMessage.state == 'DEFUSING' && myRole != Roles.SAPER){
        if(!czasUplywa){
            uruchomCzas();
        }
        setBoardView(gameMessage.visibleBoard.fields);
        $("#licznikFlag").text(gameMessage.flagCounter);
    }if(gameMessage.state == "LOST" && iknowBro){
        clearInterval(czasomierz);

        iknowBro = false;
        showNotification(gameMessage.saper+": LOST!");
        document.getElementById("buzka").innerHTML = smutnaTwarz;

        $("#licznikFlag").text(gameMessage.flagCounter);
    }if(gameMessage.state == "WIN" && iknowBro){

        iknowBro = false;
        showNotification(gameMessage.saper+": WIN!");
        $("#licznikFlag").text(gameMessage.flagCounter);
        document.getElementById("buzka").innerHTML = szczesliwaTwarz;
        clearInterval(czasomierz);
    }
    if( gameMessage.visibleBoard.fields)setBoardView(gameMessage.visibleBoard.fields);
}
function setBoardView(boardView){

    for(let i = 0; i < boardSize * (boardSize-2); i++){
        let element = document.getElementById("element" + i);
        if(boardView[i] == 9){
            element.innerHTML = "";
        }else if(boardView[i] == 10){
            element.innerHTML = ikonaFlagi;
        }else if(boardView[i] == 11){
            element.innerHTML = ikonaZnakuZapytania;
        }else if(boardView[i] == 12){
            element.classList.remove("kursor");
            element.classList.remove("zasloniety");
            element.style.backgroundColor="red";
            element.innerHTML = ikonaBomby;
        }else{
            if(boardView[i]!=0){
                var color = ["#0000FD","#017E00","#FE0001","#010180","#7F0300","#008180","#000000","#808080"];
                element.innerHTML = '<div style="color:'+color[boardView[i]]+ '">'+boardView[i]+'</div>';
            }
            element.classList.remove("zasloniety");
            element.classList.add("odkryty");

        }
    }
}
function setBoard(bombsMap){
    for(let i = 0; i < boardSize * (boardSize-2); i++){
       board.push(0);
    }
    for(let i = 0; i < bombsMap.length; i++){
        var y = Math.floor(bombsMap[i]/18);
        var x = bombsMap[i] % 18;
        board[bombsMap[i]] = "B";

        if(x < boardSize && y < boardSize-2 && x >= 0 && y >= 0){
            if(x-1 >=0){
                if(board[x-1 + (y * 18)] != "B")
                    board[x-1 + (y * 18)]++;
            }
            if(x+1 < boardSize){
                if(board[x+1+ (y * 18)] != "B")
                    board[x+1+ (y * 18)] ++;
            }
            if(y+1 < boardSize-2){
                if(board[x +((y+1) * 18)] != "B")
                    board[x +((y+1) * 18)]++;
            }
            if(y-1 >=0){
                if(board[x +((y-1) * 18)] != "B")
                    board[x +((y-1) * 18)]++;
            }
            if(y+1 < boardSize-2 && x-1>=0){
                if(board[x-1+((y+1) * 18)] != "B")
                    board[x-1+((y+1) * 18)]++;
            }
            if(y-1 >=0 && x+1 < boardSize){
                if(board[x+1+((y-1) * 18)] != "B")
                    board[x+1+((y-1) * 18)]++;
            }
            if(y+1 < boardSize-2 && x+1 < boardSize){
                if(board[x+1+((y+1) * 18)] != "B")
                    board[x+1+((y+1) * 18)]++;
            }
            if(y-1 >=0 && x-1>=0){
                if(board[x-1+((y-1) * 18)] != "B")
                    board[x-1+((y-1) * 18)]++;
            }
        }
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
        if(newRoomId != roomId){
            restart();
            clearBoard();
            enterRoom(newRoomId);
            $('#messageArea').empty();
        }

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
    $("#COMMIT").click(function () { sendBoard()});
    $("#RESTART").click(function () { initRestart()});
});
