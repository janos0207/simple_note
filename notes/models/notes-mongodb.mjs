import Note from './Note.mjs';
import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;
import process from 'process';
import DBG from 'debug';
const info = DBG('notes:info-mongodb');
const error = DBG('notes:error-mongodb');

let client;
const collectionName = 'notes';

async function connectDB() {
  if (!client) {
    client = await MongoClient.connect(process.env.MONGO_URL)
      .catch(err => { error(err); return; });
      info('mongodb connected');
  }
  return {
    db: client.db(process.env.MONGO_DBNAME),
    client: client,
  };
}

async function getCollection() {
  const { db, client } = await connectDB()
    .catch(err => { error(err); return; });
  const collection = db.collection(collectionName);
  return collection;
}

export async function create(key, title, body) {
  const collection = await getCollection();
  const note = new Note(key, title, body);
  await collection.insertOne({ notekey: Number(key), title, body })
    .catch(err => { error(err); return; });
  return note;
}

export async function update(key, title, body) {
  const collection = await getCollection();
  const note = new Note(key, title, body);
  await collection.updateOne({ notekey: Number(key) }, { $set: { title, body } })
    .catch(err => { error(err); return; });
  return note;
}

export async function read(key) {
  const collection = await getCollection();
  const doc = await collection.findOne({ notekey: Number(key) })
    .catch(err => { error(err); return; });
  if (!doc) {
    throw `No note found for the key ${key}`;
  }
  const note = new Note(doc.notekey, doc.title, doc.body);
  return note;
}

export async function destroy(key) {
  const collection = await getCollection();
  await collection.findOneAndDelete({ notekey: Number(key) })
    .catch(err => { error(err); return; });
}

export async function keylist() {
  const collection = await getCollection();
  const keys = await new Promise((resolve, reject) => {
    const keys = [];
    collection.find({}).forEach(
      note => { keys.push(note.notekey); },
      err => { err ? reject(err) : resolve(keys); }
    );
  }).catch(err => { error(err); return; });
  return keys;
}

export async function count() {
  const collection = await getCollection();
  const count = await collection.count({});
  return count;
}

export async function close() {
  if (client) client.close();
  client = undefined;
}
