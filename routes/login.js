/**
 * Created by User on 23/02/2015.
 */
var express = require('express');
var router = express.Router();
var db = require('../database.js');
var jwt = require('../jwt.js')

/* GET home page. */
router.post('/', function(req, res, next) {
    var userDetails = req.body;

    db.getUser(userDetails.name, function (err, user) {
        if (err) {
            console.log('login error: ' + err);
            next(err);
        } else {
            if (user) {
                if (user.comparePassword(userDetails.password)) {
                    console.log('Password is correct');

                    var token = jwt.createToken({ name: user.getName() });
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

module.exports = router;
