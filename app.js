const express = require('express');
const yields = require('express-yields');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const montenewModel = require('./models');
const passport = require('passport');
const Restify = require('./restify');

const index = require('./routes/index');
const users = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// database setup
montenewModel.initialize();
montenewModel.connect()
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => {
    throw e
  });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// passport setup
const AnonymousStrategy = require('passport-anonymous');
app.use(passport.initialize());
app.use(passport.session());
passport.use(require('./passport/localStrategy'));
passport.use(require('./passport/bearerStrategy'));
passport.use(new AnonymousStrategy());
passport.serializeUser(require('./passport/serializeUser'));
passport.deserializeUser(require('./passport/deserializeUser'));

// 헤더에 토큰이 있을 경우 계정 정보 입력
app.use(passport.authenticate(['bearer', 'anonymous'], { session: false }));

// routers
app.use('/', index);
app.use('/users', users);
app.use('/login', require('./routes/login'));
app.use('/me', require('./routes/me'));
app.use('/api/v1/upload', require('./routes/upload'));
app.use('/api/v1/searchad', require('./modules/searchAd/middleware/optionInjector'), require('./routes/searchad'));

// restify
app.use(Restify.initialize());

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
  res.json({ error: { message: err.message } });
});

module.exports = app;
