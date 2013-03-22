var socket = io.connect('http://localhost:3000');
$(document).ready(function() {
    var container = $('#console-log');
    socket.on('console-data', function(data) {
        var newItem = $('<p>' + data.value + '</p>');
        container.append(newItem);
    });
    socket.on('status', function(data) {
        if (data) {
        	document.getElementById("status").className = "label label-success";
        	document.getElementById("status").innerHTML="Server running";
        } else if (!data) {
        	document.getElementById("status").className = "label label-important";
   		    document.getElementById("status").innerHTML="Server not running";
        };
        console.log(data);
    });
});
$("#console-box").submit(function(e) {
    e.preventDefault(); // Prevents the page from refreshing
    var data = $("#console-input").val();
    socket.emit('command', data);
    var container = $('#console-log');
    var newItem = $('<p>' + 'Console Command: ' + data + '</p>');
    container.append(newItem);
    console.log('Console input: ' + data);
    document.getElementById("console-input").value="";
});



$("#start").click(function(e) {
    e.preventDefault(); // Prevents the page from refreshing
    socket.emit('start', 'server');
    console.log('starting server');
});
$("#stop").click(function(e) {
    e.preventDefault(); // Prevents the page from refreshing
    socket.emit('command', 'stop');
    console.log('stopping server');
});
$("#start").click(function(e) {
    e.preventDefault(); // Prevents the page from refreshing
    socket.emit('start', 'server');
    console.log('starting server');
});
$("#restart").click(function(e) {
    e.preventDefault(); // Prevents the page from refreshing
    socket.emit('command', 'stop');
    socket.on('status', function(data) {
        if (!data) {
            socket.emit('start', 'server');
        }
    })
    console.log('restarting server');
});