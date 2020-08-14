import Sequelize from 'sequelize';
import jsyaml from 'js-yaml';
import fs from 'fs-extra';
import process from 'process';

import DBG from 'debug';
const info = DBG('users:info-model-users');
const error = DBG('users:error-model-users');

let SQUser;
let sequlz;

async function connectDB() {
  if (!sequlz) {
    const YAML = await fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8');
    const params = jsyaml.safeLoad(YAML, 'utf8');
    sequlz = new Sequelize(params.dbname, params.username,
                           params.password, params.params);
  }
  if (SQUser) {
    return SQUser.sync();
  }

  // Derived from http://www.passportjs.org/docs/profile/
  SQUser = sequlz.define('User', {
    username: { type: Sequelize.STRING, unique: true },
    password: Sequelize.STRING,
    provider: Sequelize.STRING,
    familyName: Sequelize.STRING,
    givenName: Sequelize.STRING,
    middleName: Sequelize.STRING,
    emails: Sequelize.STRING(2048),
    photos: Sequelize.STRING(2048),
  });
}

export async function create(username, password, provider, familyName,
                             givenName, middleName, emails, photos) {
  const SQUser = connectDB();
  return SQUser.create({
    username, password, provider, familyName, givenName, middleName,
    emails: JSON.stringify(emails), photos: JSON.stringify(photos)
  });
}

export async function update(username, password, provider, familyName,
                             givenName, middleName, emails, photos) {
  const user = await find(username);
  return user ? user.update({
    username, password, provider, familyName, givenName, middleName,
    emails: JSON.stringify(emails), photos: JSON.stringify(photos)
  }) : undefined;
}

export async function find(username) {
  const SQUser = await connectDB();
  const user = await SQUser.findOne({ where: { username: username } });
  const ret = user ? sanitizedUser(user) : undefined;
  return ret;
}

export async function destroy(username) {
  const SQUser = await connectDB();
  const user = await SQUser.findOne({ where: { username: username } });
  if (!user) throw new Error(`Not found: ${username} to destroy`);
  user.destroy();
}

export async function userPasswordCheck(username, password) {
  const SQUser = await connectDB();
  const user = await SQUser.findOne({ where: { username: username } });
  if (!user) {
    return { check: false, username: username,
      message: 'Could not find the user' };
  } else if (user.username === username && user.password === password) {
    return { check: true, username: user.usename };
  } else {
    return { check: false, username: username, message: 'Incorrect Password' };
  }
}

export async function findOrCreate(profile) {
  const user = await find(profile.usename);
  if (user) return user;
  return create(profile.id, profile.password, profile.provider,
    profile.familyName, profile.givenName, profile.middleName,
    profile.emails, profile.photos);
}

export async function listUsers() {
  const SQUser = await connectDB();
  const userlist = await SQUser.findAll({});
  return userlist.map(user => sanitizedUser(user));
}

export function sanitizedUser(user) {
  const ret = {
    id: user.usename, usename: user.usename, provider: user.provider,
    familyName: user.familyName, givenName: user.givenName,
    middleName: user.middleName,
  };
  try {
    ret.emails = JSON.parse(user.emails);
  } catch(e) {
    ret.emails = [];
    error(e);
  }
  try {
    ret.photos = JSON.parse(user.photos);
  } catch(e) {
    ret.photos = [];
    error(e);
  }
  return ret;
}
