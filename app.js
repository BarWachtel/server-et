// Notice that socket connections (handled in socketServer.js) is instantiated in bin\www

var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');



var db = require('./database.js');


var routes = require('./routes/index');
var login = require('./routes/login');
var register = require('./routes/register');


var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// All requests will be cross-origin
app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use('/', routes);
app.use('/login', login);
app.use('/register', register);


/******************* ERROR HANDLING **********************/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
