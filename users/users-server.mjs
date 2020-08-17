import restify from 'restify';
import process from 'process';

import * as model from './users-sequelize.mjs';

import DBG from 'debug';
const info = DBG('users:info-user-service');
const error = DBG('users:error-user-service');

const server = restify.createServer({
  name: 'User-Auth-Service',
  version: '0.0.1'
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({
  mapParams: true,
}));

server.post('/create-user', async (req, res, next) => {
  try {
    const result = await model.create(req.params.username, req.params.password,
      req.params.provider, req.params.familyName, req.params.givenName,
      req.params.middleName, req.params.emails, req.params.photos);
    res.send(result);  // sanitized?
    next(false);
  } catch(err) { error(err); res.send(500, err); next(false); }
});

server.post('/update-user/:username', async (req, res, next) => {
  try {
    const result = await model.update(req.params.username, req.params.password,
      req.params.provider, req.params.familyName, req.params.givenName,
      req.params.middleName, req.params.emails, req.params.photos);
    res.send(model.sanitizedUser(result));
    next(false);
  } catch(err) { error(err); res.send(500, err); next(false); }
});

server.post('/find-or-create', async (req, res, next) => {
  try {
    const result = await model.findOrCreate({
      id: req.params.username, username: req.params.username,
      password: req.params.password, provider: req.params.provider,
      familyName: req.params.familyName, givenName: req.params.givenName,
      middleName: req.params.middleName, emails: req.params.emails,
      photos: req.params.photos
    });
    res.send(result);
    next(false);
  } catch(err) { error(err); res.send(500, err); next(false); }
});

server.get('/find/:username', async (req, res, next) => {
  try {
    const user = await model.find(req.params.username);
    if (!user) {
      res.send(404, new Error(`Could not find ${req.params.username}`));
    } else {
      res.send(user);
    }
    next(false);
  } catch(err) { error(err); res.send(500, err); next(false); }
});

server.del('/destroy/:username', async (req, res, next) => {
  try {
    await model.destroy(req.params.username);
    res.send({});
    next(false);
  } catch(err) { error(err); res.send(500, err); next(false); }
});

server.post('/passwordCheck', async (req, res, next) => {
  try {
    const result =
      await model.userPasswordCheck(req.params.username, req.params.password);
    res.send(result.check);
    next(false);
  } catch(err) { error(err); res.send(500, err); next(false); }
});

server.get('/list', async (req, res, next) => {
  try {
    const userlist = model.listUsers() || [];
    res.send(userlist);
    next(false);
  } catch(err) { error(err); res.send(500, err); next(false); }
});

server.listen(process.env.PORT, 'localhost', () => {
  info(`${server.name} listening at ${server.url}`);
});

// mimic API key authentication
const apiKeys = [{
  user: 'them',
  key: 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF'
}];

function check(req, res, next) {
  if (req.authorization) {
    let found = false;
    for (let auth of apiKeys) {
      if (auth.key === req.authorization.basic.password &&
        auth.user === req.authorization.basic.username) {
          found = true;
          break;
        }
    }
    if (found) { next(); }
    else {
      res.send(401, new Error('Not authenticated'));
      next(false);
    }
  } else {
    res.send(500, new Error('No Authorization Key'));
    next(false);
  }
}
