/**
 * Created by User on 23/02/2015.
 */
var db = require('./database');
var jwt = require('./jwt');
// Socket.io is instantiated in bin/www file !!
var socketServer = module.exports = function (server) {
    var sio = require('socket.io')(server);

    // socket.io website recommends using the following method
    // for socket authentication, the following is called prior to
    // socket being created
    sio.use(function (socket, next) {
        var query = socket.request._query;

        try {
            jwt.verifyToken(query.token, function (err, decoded) {
                if (err) {
                    console.log('Error occurred authenticating token ' + err);
                    next(new Error('Error occurred authenticating token'));
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
            console.log('Exception occurred authenticating token ' + err);
            next(new Error('Exception occurred authenticating token'));
        }
    });

    // Handle client websocket connection
    sio.on('connection', function (socket) {
        // User authentication is purely based on token authorization!!
        // Here simply add the username + socket.id to database
        var query = socket.request._query;
        db.addOnlineUser({name: query.username, socket: socket.id},
            function (err, onlineUser) {
                if (err) {
                    console.log('Error occurred adding online user, disconnecting socket');
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
    return this;
};

function handleUserLogin(socket) {
    //Closure works here!!
    var socketId = socket.id;

    socket.on('disconnect', function (msg) {
        // Make sure this isnt called when socket is disconnected server side
        console.log('Socket disconnected');
        db.removeOnlineUser({socket: socketId}, function (err) {
            if (err) {
                console.log('Some error occurred while removing user');
            } else {
                console.log('Online user removed successfully');
            }
        });
    }); // socket.on('disconnect')

    socket.emit('welcome', {msg: 'Hallo, welcome to the ethereal tournament'});

    socket.on('getOnlineUsers', function (nada) {
        console.log('getOnlineUsers request received');
        db.getOnlineUsers(function (err, onlineUsers) {
            if (err) {
                socket.emit('error', 'some error finding online users');
            } else {
                console.log('getOnlineUsers response - ');
                console.log(onlineUsers);

                socket.emit('getOnlineUsers', onlineUsers);
                socket.broadcast.emit('getOnlineUsers', onlineUsers);
            }
        });
    });
}
