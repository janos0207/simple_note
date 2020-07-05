import path from 'path';
import fs from 'fs-extra';
import util from 'util';
import process from 'process';
import Note from './Note.mjs';
import level from 'level';
// import DBG from 'debug';
// const error = DBG('notes:error');
// const debug = DBG('notes:debug');


let db;

async function connectDB() {
  console.log('connecting levelDB...');
  if (typeof db !== 'undefined' || db) return db;
  db = await level(
      process.env.LEVELDB_LOCATION || 'notes.level', {
        createIfMissing: true,
        valueEncoding: 'json',
      });
  console.log('db created.');
  return db;
}

async function crupdate(key, title, body) {
  const db = await connectDB();
  const note = new Note(key, title, body);
  await db.put(key, note.JSON);
  return note;
}

export function create(key, title, body) {
  return crupdate(key, title, body);
}

export function update(key, title, body) {
  return crupdate(key, title, body);
}

export async function read(key) {
  const db = await connectDB();
  const note = Note.fromJSON(await db.get(key));
  return note;
}

export async function destroy(key) {
  const db = await connectDB();
  await db.del(key);
}

export async function keylist() {
  const db = await connectDB();
  const keys = [];
  await new Promise((resolve, reject) => {
    db.createKeyStream()
    .on('data', data => keys.push(data))
    .on('error', err => reject(err))
    .on('end', () => resolve(keys));
  });
  return keys;
}

export async function count() {
  const db = await connectDB();
  let total = 0;
  await new Promise((resolve, reject) => {
    db.createKeyStream()
    .on('data', _data => total++)
    .on('error', err => reject(err))
    .on('end', () => resolve(total));
  });
  return total;
}

export async function close() {
  const _db = db;
  db = undefined;
  return _db ? _db.close() : undefined;
}