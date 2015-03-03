var mongoose = require('mongoose');

/* BREAK THESE INTO INDIVDUAL FILES */

/* USER SCHEMA */
var userSchema = mongoose.Schema({
  name: String,
  password: String
});

userSchema.methods.comparePassword = function (password) {
  return this.password === password;
}

userSchema.methods.getName = function () {
  return this.name;
}
/* USER SCHEMA */


/* ONLINE USER SCHEMA */
var onlineUserSchema = mongoose.Schema({
  name: String,
  socket: String
  //token: String
});

//onlineUserSchema.methods.compareToken = function(token) {
//  return this.token === token;
//}

onlineUserSchema.methods.getName = function() {
  return this.name;
}

onlineUserSchema.methods.getSocket = function() {
  return this.socket;
}

//onlineUserSchema.methods.getToken = function() {
//  return this.token;
//}

onlineUserSchema.methods.setName = function(name) {
  this.name = name;
}

onlineUserSchema.methods.setSocket = function(socket) {
  this.socket = socket;
}

//onlineUserSchema.methods.setToken = function(token) {
//  this.token = token;
//}
/* ONLINE USER SCHEMA */


/* USER FRIENDSHIP SCHEMA */
var userFriendshipSchema = mongoose.Schema({
  friendship: [String, String]
});
/* USER FRIENDSHIP SCHEMA */

module.exports = {
  user: userSchema,
  onlineUser: onlineUserSchema,
  userFriendship: userFriendshipSchema
}
