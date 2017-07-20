const Discord = require('discord.js');
const bot = new Discord.Client();

const fs = require('fs')

var online = false;

var channelSelected = false;
var sendChannel;

bot.on('ready', function () {
    bot.guilds.forEach(function (server) {
        var serverLabel = $(document.createElement('h3'));
        var serverContainer = $(document.createElement('div'));
        serverContainer.addClass('server-container')
        serverLabel.html(server.name)
        serverLabel.addClass('server')
        $('.text-display').append(serverContainer)
        $(serverContainer).append(serverLabel)
        server.channels.forEach(function (channel) {
            if (channel.type == "text") {
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

bot.on('message', (message) => {
    if (channelSelected == true) {
        if (message.channel.id == sendChannel) {
            var messageC = $(document.createElement("div"));
            var messageR = $(document.createElement("p"));
            messageR.addClass("message-received");
            messageC.addClass("message-holder");
            messageR.html(message.content);
            $(".message-display").append(messageC);
            $(messageC).append(messageR);
            $(".message-display").scrollTop($(".message-display")[0].scrollHeight);
        }
    }
})

function reverseSend(messages) {
    var messagesReverse = new Map(Array.from(messages).reverse())
    messagesReverse.forEach(function (messageF) {
        var messageC = $(document.createElement("div"));
        var messageR = $(document.createElement("p"));
        messageR.addClass("message-received");
        messageC.addClass("message-holder");
        messageR.html(messageF.content);
        $(".message-display").append(messageC);
        $(messageC).append(messageR);
    })
    $(".message-display").scrollTop($(".message-display")[0].scrollHeight);
}

function getMessages(id) {
    var channelR = bot.channels.get(id);
    channelR.fetchMessages({
        limit: 100
    }).then(messages => reverseSend(messages));
}

$(document).on('click', '.message-container', function () {
    channelSelected = true;
    sendChannel = $(this).attr('id')
    var name = $(this).attr('name')
    var server = $(this).attr('server')
    $('#message-text').attr('placeholder', 'Message #' + name + " in " + server)
    var clickedChannel = $(this).find(".channel")
    $(".channel").removeClass('make-gray')
    clickedChannel.addClass('make-gray')
    getMessages(sendChannel);
})

$("#start").click(function () {
    if (online == false) {
        var string = fs.readFileSync('../save.txt', 'utf8')
        var object = JSON.parse(string)
        var key = object.key;
        bot.login(key);
        online = true;
        $('#message-text').attr('placeholder', 'Please select channel to send message to')
    } else {
        alert("The bot is already on");
    }
    return;
})

$("#stop").click(function () {
    if (online == true) {
        bot.destroy();
        online = false;
        $('#message-text').attr('placeholder', 'Bot must be online to send messages')
        $('.text-display').empty();
    } else {
        alert("The bot is not online");
    }
    return;
})

$('.message-text').on('keydown', function (e) {
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
        document.getElementById("message-text").value = "";
    }
})