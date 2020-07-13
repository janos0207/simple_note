import express from 'express';
export const router = express.Router();
import * as notes from '../models/notes.mjs';

/* GET home page. */
router.get('/', async (req, res) => {
  const keylist = await notes.keylist();
  const keyPromises = keylist.map((key) => notes.read(key));
  const notelist = await Promise.all(keyPromises);
  res.render('index', {title: 'Notes', notelist: notelist});
});
