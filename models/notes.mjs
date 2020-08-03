import process from 'process';

let NotesModule;
const dbModelPath = `../models/notes-${process.env.NOTES_MODEL}.mjs`;

export async function model() {
  if (NotesModule) return NotesModule;

  NotesModule = await import(dbModelPath)
    .then((module) => {
      return module;
    })
    .catch(err => console.error(err));
  return NotesModule;
}

export async function create(key, title, body) {
  return (await model()).create(key, title, body);
}

export async function update(key, title, body) {
  return (await model()).update(key, title, body);
}


export async function read(key) { return (await model()).read(key); }

export async function destroy(key) { return (await model()).destroy(key); }

export async function keylist() { return (await model()).keylist(); }

export async function count() { return (await model()).count(); }

export async function close() { return (await model()).close(); }
