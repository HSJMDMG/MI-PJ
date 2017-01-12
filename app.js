var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var io = require('socket.io');
//New add



var index = require('./routes/index');
var usrInfo = require('./routes/usrInfo');
var login = require('./routes/login');
//var logout = require('./routes/logout');
var register = require('./routes/register');
var addActivity = require('./routes/addActivity');
var checkActivity = require('./routes/checkActivity');




var app = express();

/*
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

io.on( "connection", function( socket ){
    console.log( "一个新连接" );
    console.log('\033[96msomeone has changed the voting result\033[39m \n');

    socket.on('modify', function(msg){
        // 有人更改了结果，aid为msg
        io.sockets.emit('update', msg);
});
http.listen(port,function(){
    console.log('正在监听3000端口');
});


*/


//New ADD
//http.listen(3000, function(){
//  console.log('listening on *:3000');
//});

var server = app.listen(3000, '127.0.0.1');


var ws = io.listen(server);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//有人更新了自己的投票结果，需要给所有人发消息，更新页面
ws.on('connection', function(client){
  console.log('\033[96msomeone has changed the voting result\033[39m \n');
  client.on('modify', function(msg){
      // 有人更改了结果，aid为msg
      io.sockets.emit('update', msg);

  });
});


app.use('/', index);

app.use('/login', login);
//app.use('/logout', logout);
app.use('/register', register);

app.use('/usrInfo', usrInfo);
app.use('/addActivity', addActivity);
app.use('/checkActivity', checkActivity);









// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
