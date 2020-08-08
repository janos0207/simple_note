import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fs from 'fs-extra';
import rfs from 'rotating-file-stream';
import hbs from 'hbs';
import util from 'util';
import process from 'process';

import DBG from 'debug';
const error = DBG('notes:error');
// const debug = DBG('notes:debug');

import {router as indexRouter} from './routes/index.mjs';
// const usersRouter = require('./routes/users');
import {router as noteRouter} from './routes/notes.mjs';


const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

let logStream = '';
// log to a file if requested
if (process.env.REQUEST_LOG_FILE) {
  (async () => {
    const logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
    await fs.ensureDir(logDirectory);
    logStream = rfs(process.env.REQUEST_LOG_FILE, {
      size: '10M',
      interval: '1d',
      compress: 'gzip',
    });
  })().catch((err) => {
    console.error(err);
  });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/notes', noteRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

process.on('uncaughtException', (err) => {
  error('App Crached!! - ' + (err.stack || err));
});

process.on('unhandledRejection', (reason, p) => {
  error(`Unhandled Rejection at: ${util.inspect(p)} with reason: ${reason}`);
});

// error handler
app.use((err, req, res) => {
  // render the error page
  res.status(err.status || 500);
  error((err.status || 500) + ' ' + error.message);
  res.render('error', {
    message: err.message,
    err: req.app.get('env') === 'development' ? err : {},
  });
});

app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
  stream: logStream || process.stdout,
}));

export default app;
