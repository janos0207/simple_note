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
  if (req.body.docreate === "create") {
    note = await notes.create(req.body.notekey, req.body.title, req.body.body);
  } else {
    note = await notes.update(req.body.notekey, req.body.title, req.body.body);
  }
  res.redirect('/notes/view?key=' + req.body.notekey);
})