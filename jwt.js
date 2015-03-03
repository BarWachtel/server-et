/**
 * Created by User on 23/02/2015.
 */
//Creates a JWT token and returns it to user
var jwt = require('jsonwebtoken');
var jwtSecret = 'AFBE234ssSAsas8hjfSECREtsz';

// THIS WORKS -
//app.set('jwtSecret', jwtSecret);
//app.get('jwtSecret');

// Helper functions
function _createToken(info) {
    // as of now jwtSecret is a global variable - not good design
    return jwt.sign(info, jwtSecret, { expiresInMinutes: 60 * 5 });
}

function _verifyToken(token, callback) {
    jwt.verify(token, jwtSecret, callback);
}

module.exports = {
    jwt: jwt,
    verifyToken: _verifyToken,
    createToken: _createToken
}