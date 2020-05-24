const Note = require('./Note');

let notes = [];

exports.update = exports.create = async function(key, title, body) {
  notes[key] = new Note(key, title, body);
  return notes[key];
};

exports.read = async function(key) {
  if (note[key]) {
    return notes[key];
  } else {
    throw new Error(`Note ${key} does not exist`);
  }
}

exports.destroy = async function(key) {
  if (notes[key]) {
    delete notes[key];
  } else {
    throw new Error(`Note ${key} does not exist`);
  }
}
