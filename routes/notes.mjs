// import util from 'util';
import express from 'express';
export const router = express.Router();
// import * as notes from '../models/notes-memory.mjs';
import * as notes from '../models/notes-level.mjs';

router.get('/add', (req, res) => {
  res.render('noteedit', {
    title: 'Add a note',
    docreate: true,
    notekey: '',
    note: undefined,
  });
});

// Update
router.post('/save', async (req, res) => {
  let note;
  const notekey = req.body.notekey || generateKey();
  console.log('INFO: docreate:', req.body.docreate);
  if (req.body.docreate === 'create') {
    note = await notes.create(notekey, req.body.title, req.body.body);
  } else {
    note = await notes.update(notekey, req.body.title, req.body.body);
  }
  res.redirect('/notes/view?key=' + notekey);
});

// Read
router.get('/view', async (req, res) => {
  const note = await notes.read(req.query.key);
  res.render('noteview', {
    title: note ? note.title : '',
    notekey: req.query.key,
    note: note,
  });
});

// Edit
router.get('/edit', async (req, res) => {
  const note = await notes.read(req.query.key);
  res.render('noteedit', {
    title: note ? ('Edit: ' + note.title) : 'Add a Note',
    docreate: false,
    notekey: req.query.key,
    note: note,
  });
});

// Ask to Destroy the Note
router.get('/destroy', async (req, res) => {
  const note = await notes.read(req.query.key);
  res.render('notedestroy', {
    title: note ? note.title : '',
    notekey: req.query.key,
    note: note,
  });
});

// Do Destroy the Note
router.post('/destroy/confirm', async (req, res) => {
  await notes.destroy(req.body.notekey);
  res.redirect('/');
});

// TODO: validation for duplicates
function generateKey() {
  const max = 1000;
  return Math.floor(Math.random() * max);
}
