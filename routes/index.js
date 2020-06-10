const express = require('express');
const router = express.Router();
const notes = require('../models/notes-memory');

/* GET home page. */
router.get('/', async (req, res, next) => {
  let keylist = await notes.keylist();
  let keyPromises = keylist.map(key => notes.read(key));
  let notelist = await Promise.all(keyPromises);
  res.render('index', { title: 'Notes', notelist: notelist});
});

module.exports = router;
