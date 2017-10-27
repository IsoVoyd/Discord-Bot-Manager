//test

const Discord = require('discord.js');
const bot = new Discord.Client();

const remote = require('electron').remote;
const app = remote.app;

const fs = require('fs')

var online = false;

var channelSelected = false;
var sendChannel;

function getServers() {
    bot.guilds.forEach(function (server) {
        var serverLabel = $(document.createElement('h3'));
        var serverContainer = $(document.createElement('div'));
        var icon = $(document.createElement('img'));
        serverContainer.addClass('server-container');
        serverContainer.attr('id', server.id);
        serverLabel.html(server.name);
        serverLabel.addClass('server');
        icon.attr("src", server.iconURL);
        icon.attr("id", "icon");
        icon.addClass("pfp");
        $('.text-display').append(serverContainer);
        $(serverContainer).append(icon);
        $(serverContainer).append(serverLabel);
    })
}

//loads all the guilds when the bot is ready to go
bot.on('ready', function () {
    getServers();
})

//adds message to the text box
function appendMessage(message) {
    var messageC = $(document.createElement("div"));
    var messageA = $(document.createElement("span"));
    var br = $(document.createElement("br"))
    var messageR = $(document.createElement("span"));
    var pfp = $(document.createElement("img"));
    var i = $(document.createElement("i"));
    i.addClass("material-icons md-inactive md-dark md-18");
    i.attr("id", message.id);
    i.html("delete");
    pfp.attr("src", message.author.avatarURL);
    pfp.addClass("pfp")
    messageA.addClass("message-author");
    var colorS = message.member.displayHexColor;
    if (colorS == "#000000") {
        colorS = "#a6a6a6"
    }
    messageA.css("color", colorS)
    messageR.addClass("message-received");
    messageC.addClass("message-holder");
    if (message.member.nickname == null) {
        var name = message.author.username;
    } else {
        var name = message.member.nickname
    }
    messageA.html(name + ":");
    messageR.html(message.cleanContent);
    $(".message-display").append(messageC);
    $(messageC).append(pfp)
    $(messageC).append(messageA);
    $(messageC).append(i);
    $(messageC).append(br);
    $(messageC).append(messageR);
    $(".message-display").scrollTop($(".message-display")[0].scrollHeight);
}

//adds message to text box when a message can be seen by the bot
bot.on('message', (message) => {
    if (channelSelected == true) {
        if (message.channel.id == sendChannel) {
            appendMessage(message);
        }
    }
})

//puts the messages in reverse order since they come in newest to oldest
function reverseSend(messages) {
    var messagesReverse = new Map(Array.from(messages).reverse())
    messagesReverse.forEach(function (messageF) {
        appendMessage(messageF);
    })
    
}

//gets the last 50 messages from the channel when the bot is ready
function getMessages(id) {
    var channelR = bot.channels.get(id);
    channelR.fetchMessages({
        limit: 50
    }).then(messages => reverseSend(messages));
}

//shows all channels in the server that was clicked
$(document).on('click', '.server-container', function (e) {
    $('.text-display').empty();
    $('.message-display').empty();
    $('#back').show();
    var serverId = $(this).attr('id');
    var channels = 0;
    let positions = [];
    
    bot.guilds.get(serverId).channels.forEach(function (channel) {
        if (channel.type == "text") positions.push(channel.position);
    })
    
    positions.forEach(function (positionF) {
        bot.guilds.get(serverId).channels.forEach(function (channel) {
            if (channel.position == positionF && channel.type !== "voice") {
                var message = $(document.createElement('p'))
                var messageContainer = $(document.createElement('div'))
                messageContainer.addClass('message-container')
                messageContainer.attr('id', channel.id)
                messageContainer.attr('name', channel.name)
                messageContainer.attr('server', channel.guild.name)
                message.addClass("channel")
                message.html("#" + channel.name);
                $('.text-display').append(messageContainer)
                $(messageContainer).append(message)
            }
            
        })
        
    })
    
})

//shows messages in the channel that was clicked
$(document).on('click', '.message-container', function () {
    channelSelected = true;
    sendChannel = $(this).attr('id')
    var name = $(this).attr('name')
    var server = $(this).attr('server')
    $('#message-text').attr('placeholder', 'Message #' + name + " in " + server)
    var clickedChannel = $(this).find(".channel")
    $(".channel").removeClass('make-gray')
    clickedChannel.addClass('make-gray')
    $('.message-display').empty();
    getMessages(sendChannel);
})

$(document).on('click', '#back', function () {
    $('.text-display').empty();
    $('.message-display').empty();
    $(this).hide();
    getServers();
})

//delete message
$(document).on('click', '.material-icons', function () {
    var messageID = $(this).attr("id");
    bot.channels.get(sendChannel).fetchMessage(messageID).then(message => message.delete());
    $(this).parent().remove();
})

//logs in the bot once the start button was clicked
$("#start").click(function () {
    if (online == false) {
        var string = fs.readFileSync(app.getPath("appData") + "/DBM/save.txt", 'utf8')
        var object = JSON.parse(string)
        var key = object.key;
        var error = false;
        bot.login(key).catch(err => {
            alert("The bot was unable to login, please check your internet connection, and make sure your bot key is correct")
            console.error(err.stack)
            error = true;
            return;
        });
        setTimeout(function () {
            if (error == false) {
                online = true;
                $('#message-text').attr('placeholder', 'Please select channel to send message to')
            }
        }, 2000);
    } else {
        alert("The bot is already on");
    }
    return;
})

//logs the bot off and empties both divs
$("#stop").click(function () {
    if (online == true) {
        bot.destroy();
        online = false;
        $('#message-text').attr('placeholder', 'Bot must be online to send messages')
        $('.text-display').empty();
        $('.message-display').empty();
    } else {
        alert("The bot is not online");
    }
    return;
})

//makes sure the bot is online before attemption to send a message
$('#message-text').on('keydown', function (e) {
    if (e.which == 13) {
        e.preventDefault();
        if (online == false) {
            alert("The bot must be online for you to send a message");
            return;
        } else if (document.getElementById("message-text").value == "") {
            alert("You cannot send a blank message");
            return;
        } else if (channelSelected == false) {
            alert("You must select a channel to send a message in")
            return;
        }

        bot.channels.get(sendChannel).send(document.getElementById("message-text").value);
        $("#message-text").val("");
    }
})