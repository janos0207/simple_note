import fs from 'fs-extra';
import jsyaml from 'js-yaml';
import process from 'process';
import Sequelize from 'sequelize';
import Note from './Note.mjs';

import DBG from 'debug';
const error = DBG('notes:error');
const info = DBG('notes:info');

let SQNote;
let sequlz;

async function connectDB() {
  if (typeof sequlz === 'undefined') {
    const YAML = await fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8');
    const params = jsyaml.safeLoad(YAML, 'utf8');
    sequlz = new Sequelize(params.dbname, params.username, params.password, params.params);
  }
  if (SQNote) return SQNote.sync();
  SQNote = sequlz.define('Note', {
    notekey: { type: Sequelize.STRING, primaryKey: true, unique: true },
    title: Sequelize.STRING,
    body: Sequelize.TEXT,
  });
  info('SQNote Created');
  return SQNote.sync();
}


export async function create(key, title, body) {
  const SQNote = await connectDB()
    .catch(err => { error(err); return err; });
  const note = new Note(key, title, body);
  await SQNote.create({ notekey: key, title: title, body: body })
    .catch(err => { error(err); return err; });
  return note;
}

export async function update(key, title, body) {
  const SQNote = await connectDB();
  const note = await SQNote.findOne({ where: { notekey: key }});
  if (!note) {
    throw new Error(`No note found for ${key}`);
  } else {
    await note.update({ title: title, body: body });
    return new Note(key, title, body);
  }
}

export async function read(key) {
  const SQNote = await connectDB();
  const note = await SQNote.findOne({ where: { notekey: key } });
  if (!note) {
    throw new Error(`No note found for ${key}`);
  } else {
    return new Note(note.notekey, note.title, note.body);
  }
}

export async function destroy(key) {
  const SQNote = await connectDB();
  const note = await SQNote.findOne({ where: { notekey: key } });
  return note.destroy();
}

export async function keylist() {
  const SQNote = await connectDB();
  const allNotes = await SQNote.findAll({ attributes: [ 'notekey' ] })
    .catch(err => { error(err); return err; });
  const keys = allNotes.map(note => note.notekey);
  info('keylist: ', keys);
  return keys;
}

export async function count() {
  const SQNote = await connectDB();
  const count = await SQNote.count();
  return count;
}

export async function close() {
  if (sequlz) sequlz.close();
  sequlz = undefined;
  SQNote = undefined;
}
