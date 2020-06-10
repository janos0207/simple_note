const util = require('util');
const express = require('express');
const router = express.Router();
const notes = require('../models/notes-memory');

module.exports = router;

router.get('/add', (req, res, next) => {
  res.render('noteedit', {
      title: "Add a note",
      docreate: true,
      notekey: "",
      note: undefined,
  });
});

// Update
router.post('/save', async (req, res, next) => {
  let note;
  const notekey = !!req.body.notekey ? req.body.notekey : generate_key();
  console.log('INFO: docreate:', req.body.docreate);
  if (req.body.docreate === 'create') {
    note = await notes.create(notekey, req.body.title, req.body.body);
  } else {
    note = await notes.update(notekey, req.body.title, req.body.body);
  }
  res.redirect('/notes/view?key=' + notekey);
});

// Read
router.get('/view', async (req, res, next) => {
  let note = await notes.read(req.query.key);
  res.render('noteview', {
    title: note ? note.title: "",
    notekey: req.query.key,
    note: note,
  });
});

// Edit
router.get('/edit', async (req, res, next) => {
  let note = await notes.read(req.query.key);
  res.render('noteedit', {
    title: note ? ("Edit: " + note.title) : "Add a Note",
    docreate: false,
    notekey: req.query.key,
    note: note,
  })
})

// Ask to Destroy the Note
router.get('/destroy', async (req, res, next) => {
  let note = await notes.read(req.query.key);
  res.render('notedestroy', {
    title: note ? note.title : "",
    notekey: req.query.key,
    note: note,
  });
});

// Do Destroy the Note
router.post('/destroy/confirm', async (req, res, next) => {
  await notes.destroy(req.body.notekey);
  res.redirect('/');
});

// TODO: validation for duplicates
function generate_key() {
  const max = 1000;
  return Math.floor(Math.random() * max);
}
