/**
 * Created by User on 23/02/2015.
 */
var express = require('express');
var router = express.Router();
var db = require('../database')

/* GET home page. */
router.post('/', function (req, res, next) {
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

// Possibly unnecessary
//router.post('*', function (req, res, next) {
//    res.statusCode = 200;
//    res.end();
//})

module.exports = router;
