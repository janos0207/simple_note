const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs-extra');
const rfs = require('rotating-file-stream');
const error = require('debug')('notes:error');
const hbs = require('hbs');
const util = require('util');

const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
const noteRouter = require('./routes/notes');

const app = express();

let logStream = '';
// log to a file if requested
if (process.env.REQUEST_LOG_FILE) {
  (async () => {
    let logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
    await fs.ensureDir(logDirectory);
    logStream = rfs(process.env.REQUEST_LOG_FILE, {
      size: '10M',
      interval: '1d',
      compress: 'gzip',
    });
  })().catch(err => { console.error(err); });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/notes', noteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

process.on('uncaughtException', function(err) {
  error('App Crached!! - ' + (err.stack || err));
});

process.on('unhandledRejection', (reason, p) => {
  error(`Unhandled Rejection at: ${util.inspect(p)} with reason: ${reason}`);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  error((err.status || 500) + ' ' + error.message);
  res.render('error', {
    message: err.message,
    err: req.app.get('env') === 'development' ? err : {},
  });
});

app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
  stream: !!logStream ? logStream : process.stdout
}));

module.exports = app;
