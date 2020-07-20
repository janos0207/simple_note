// import util from 'util';
import Note from './Note.mjs';
import sqlite3 from 'sqlite3';
import process from 'process';
import DBG from 'debug';
// const debug = DBG('notes:notes-sqlite3');
const error = DBG('notes:error-sqlite3');

let db;

async function connectDB() {
  if (db) return db;
  const dbfile = process.env.SQLITE_FILE || 'notes.sqlite3';
  await new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbfile,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      err => {
        if (err) return reject(err);
        resolve(db);
      });
  }).catch(err => console.error(err));
  return db;
}

export async function create(key, title, body) {
  const db = await connectDB();
  const note = new Note(key, title, body);
  await new Promise((resolve, reject) => {
    db.run('INSERT INTO notes (notekey, title, body) ' +
      'VALUES (?, ?, ?) ', [key, title, body], err => {
        if (err) return reject(err);
        resolve(note);
      });
  }).catch(err => error(err));
  return note;
}

export async function update(key, title, body) {
  const db = await connectDB();
  const note = new Note(key, title, body);
  await new Promise((resolve, reject) => {
    db.run('UPDATE notes ' +
      'SET title = ?, body = ? WHERE notekey = ?',
      [title, body, key], err => {
        if (err) return reject(err);
        resolve(note);
      });
  }).catch(err => error(err));
  return note;
}

export async function read(key) {
  const db = await connectDB();
  const note = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM notes WHERE notekey = ?', [key], (err, row) => {
      if (err) return reject(err);
      const note = new Note(row.notekey, row.title, row.body);
      resolve(note);
    });
  }).catch(err => error(err));
  return note;
}

export async function destroy(key) {
  const db = await connectDB();
  return await new Promise((resolve, reject) => {
    db.run('DELETE FROM notes WHERE notekey = ?', [key], err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function keylist() {
  const db = await connectDB();
  const keys = await new Promise((resolve, reject) => {
    db.all('SELECT notekey FROM notes', (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map(row => row.notekey));
    });
  }).catch(err => error(err));
  return keys;
}

export async function count() {
  const db = await connectDB();
  const count = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(notekey) AS count FROM notes', (err, row) => {
      if (err) return reject(err);
      resolve(row.count);
    });
  });
  return count;
}

export async function close() {
  const _db = db;
  db = undefined;
  return _db ? new Promise((resolve, reject) => {
    _db.close(err => {
      if (err) reject(err);
      else resolve();
    });
  }) : undefined;
}
