var mongoose = require('mongoose');
var schema = require('./schema');

var dbName = 'users';
mongoose.connect('mongodb://localhost/' + dbName);

var mongodb = mongoose.connection;
var User = mongodb.model('User', schema.user);
var OnlineUser = mongodb.model('OnlineUser', schema.onlineUser);
var UserFriendship = mongodb.model('UserFriendship', schema.userFriendship);

mongodb.on('error', console.error.bind('Error connecting to db:' + dbName));
mongodb.once('open', function (callback) {
    // Empty OnlineUser collection
    OnlineUser.remove({}, function (err) {
        if (err) {
            console.log('Error occured emptying OnlineUser collection: ' + err);
        }
    });

    // console.log('Connection to db:' + dbName + ' established');
    // var userDetails = {
    //   name: 'mazza',
    //   password: 'kamaroi'
    // };
    // _addUser(userDetails, function() {
    //   _getUser(userDetails.name, function(err, user) {
    //     console.log('user.name: ' + user.name); // this works
    //   });
    // });
});


function _getUser(name, callback) {
    //callback(err, data)
    User.findOne({'name': name}, callback);
}

function _addUser(userDetails, callback) {
    // Must check if user already exists !!
    _getUser(userDetails.name, function (err, user) {
        if (err) {
            callback(err);
        } else {
            if (user === null) {
                // No such user exists
                User.create({name: userDetails.name, password: userDetails.password}, callback);
            } else {
                //User found - already exists do not add
                console.log('user.name: ' + user.name);
                callback('User already exists');
            }
        }
    });
}


function _addOnlineUser(user, callback) {
    _getOnlineUser(user.name, function (err, _user) {
        if (err) {
            callback(err);
        } else {
            if (_user === null) {
                console.log('User is not online, add him');
                // These should be added with a time-to-live
                OnlineUser.create({name: user.name, socket: user.socket}, callback);
            } else {
                console.log('User is already online');
                callback(true);
            }
        }
    });
}

function _removeOnlineUser(user, callback) {
    OnlineUser.remove({$or: [{name: user.name}, {socket: user.socket}]}, callback);
}

function _getOnlineUser(username, callback) {
    OnlineUser.findOne({name: username}, callback);
}

function _getOnlineUsers(callback) {
    OnlineUser.find({}, callback);
}

module.exports = {
    getUser: _getUser,
    addUser: _addUser,
    getOnlineUser: _getOnlineUser,
    getOnlineUsers: _getOnlineUsers,
    removeOnlineUser: _removeOnlineUser,
    addOnlineUser: _addOnlineUser
}

/*
 mongo methods:
 - show all documents in collection foo: db.foo.find()
 */


/*
 User collection:
 Functions:
 - addUser(userDetails)
 - getUser(username)

 onlineUsers collection:
 var onlineUserSchema = mongoose.schema({
 name: String,
 socket: String *socket.id
 });
 Functions:
 - storeOnlineUser(username)
 - removeOnlineUser(username)
 - areOnline()

 userFriendship collection:
 var userFriendshipSchema = mongoose.schema({
 friendship: [String, String] *usernames
 });
 Functions:
 - addFriendship([username, username])
 - removeFriendship([username, username])
 - [usernames..] getFriends(username)
 */
