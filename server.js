/*
* MIGRATE ALL THIS TO APP.JS
* */

// HTTP and WebSocket server initialization
var express = require('express');
var app = express();
var server = require('http').Server(app);
var sio = require('socket.io')(server);
var portNumber = 9000;

// Used to parse POST body
var bodyParser = require('body-parser');
// var url = require('url');

//Creates a JWT token and returns it to user
var jwt = require('jsonwebtoken');
var jwtSecret = 'AFBE234ssSAsas8hjfSECREtsz';

// THIS WORKS -
//app.set('jwtSecret', jwtSecret);
//app.get('jwtSecret');

var db = require('./database.js');

// Express app
// Parse body - creates request.body (access query parameters)
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
	//Anything following next() is executed
});


// Handle client HTTP POST requests
app.post('/login', function (req, res) {
    var userDetails = req.body;
    
    db.getUser(userDetails.name, function (err, user) {
        if (err) {
            console.log('login error: ' + err);
            next(err);
        } else {
            if (user) {
                if (user.comparePassword(userDetails.password)) {
                    console.log('Password is correct');
                    
                    var token = createToken({ name: user.getName() });
                    res.contentType('json');
                    res.json({ token: token });
                } else {
                    res.json({
                        reply: 'Incorrect password',
                        token: null
                    });
                }
            } else {
                // user is null
                res.json({
                    reply: 'User does not exist',
                    token: null
                });
            }
        }
    });
});

app.post('/register', function (req, res) {
    // Example of how to send a simple response to client
    // res.send('Hey, please add username and password');
    var userDetails = req.body;
    if (userDetails.password === userDetails.confirmPassword) {
        db.addUser(userDetails, function (err, user) {
            if (err) {
                console.log('add user error: ' + err);
                res.send('Username was already taken!');
            } else {
                console.log('User added');
                
                res.send('Hi ' + user.name +
				', your user was created successfuly');
            }
        }); // db.addUser
    } else {
        res.send('Passwords do not match, try again');
    }
}); // post

app.post('*', function (req, res, next) {
    res.statusCode = 200;
    res.end();
})

// Start HTTP server
server.listen(portNumber);

//WebSocket server

// socket.io website recommends using the following method
// for socket authentication, the following is called prior to
// socket being created
sio.use(function (socket, next) {
    var query = socket.request._query;
    
    try {
        jwt.verify(query.token, jwtSecret, function (err, decoded) {
            if (err) {
                console.log('Error occured authenticating token ' + err);
                next(new Error('Error occured authenticating token'));
            } else {
                console.log('authenticated ' + decoded.name + '\'s token');
                if (decoded.name === query.username) {
                    next();
                } else {
                    next(new Error('Username sent does not match that in decoded token'));
                }
                    //Not moving onto on('connection') method !!
                    //next(socket);
            }
        });
    } catch (err) {
        console.log('Exception occured authenticating token ' + err);
        next(new Error('Exception occured authenticating token'));
    }
});

// Handle client websocket connection
sio.on('connection', function (socket) {
    // User authentication is purely based on token authorization!!
    // Here simply add the username + socket.id to database
    var query = socket.request._query;
    db.addOnlineUser({ name: query.username, socket: socket.id }, function (err, onlineUser) {
        if (err) {
            console.log('Error occured adding online user, disconnecting socket');
            socket.disconnect();
        } else {
            if (onlineUser) {
                console.log('Hooray! ' + query.username + ' logged on');
                handleUserLogin(socket);
            }
        }
    });

    //This might be useful
    //Model.save(function (err) { });
}); // sio.on('connection')


function handleUserLogin(socket) {
    //Closure works here!!
    var socketId = socket.id;

    socket.on('disconnect', function (msg) {
        // Make sure this isnt called when socket is disconnected server side
        console.log('Socket disconnected');
        db.removeOnlineUser({ socket: socketId }, function (err) {
            if (err) {
                console.log('Some error occured while removing user');
            } else {
                console.log('Online user removed successfuly');
            }
        });
    }); // socket.on('disconnect')
    
    socket.emit('welcome', { msg: 'Hallo, welcome to the ethereal tournament' });
}

module.exports = app;