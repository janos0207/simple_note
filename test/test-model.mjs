/* eslint-env mocha */
import Chai from 'chai';
const assert = Chai.assert;
import * as model from '../models/notes.mjs';

describe('Model Test', function() {
  beforeEach(async function() {
    try {
      const keys = await model.keylist();
      for (let key of keys) {
        await model.destroy(key);
      }
      await model.create('n1', 'Note1', 'body1');
      await model.create('n2', 'Note2', 'body2');
      await model.create('n3', 'Note3', 'body3');
    } catch(e) {
      console.error(e);
      throw e;
    }
  });

  describe('check keylist', function() {
    it('should have 3 entries', async function() {
      const keys = await model.keylist();
      assert.exists(keys);
      assert.isArray(keys);
      assert.lengthOf(keys, 3);
    });
    it('should have keys n1 n2 n3', async function() {
      const keys = await model.keylist();
      assert.exists(keys);
      assert.isArray(keys);
      assert.lengthOf(keys, 3);
      for (let key of keys) {
        assert.match(key, /n[123]/, 'correct key');
      }
    });
    it('should have titles Note#', async function() {
      const keys = await model.keylist();
      assert.exists(keys);
      assert.isArray(keys);
      assert.lengthOf(keys, 3);
      const keyPromises = keys.map(key => model.read(key));
      const notes = await Promise.all(keyPromises);
      for (let note of notes) {
        assert.match(note.title, /Note[123]/, 'correct title');
      }
    });
  });

  describe('read note', function() {
    it('should have proper note', async function() {
      const note = await model.read('n1');
      assert.exists(note);
      assert.deepEqual(
        {key: note.key, title: note.title, body: note.body},
        {key: 'n1', title: 'Note1', body: 'body1'}
      );
    });
    it('unknown note should fail', async function() {
      try {
        const note = await model.read('nonexistent_key');
        // assert.notExists(note);  // this would be invoked?
        throw new Error('should not get here');
      } catch(err) {
        assert.notEqual(err.message, 'should not get here');
      }
    });
  });

  describe('update note', function() {
    it('after a successful update method', async function() {
      const newNote = await model.update('n1', 'NewNote1', 'newBody1');
      const note = await model.read('n1');
      assert.exists(note);
      assert.deepEqual(
        {key: note.key, title: note.title, body: note.body},
        {key: 'n1', title: 'NewNote1', body: 'newBody1'}
      );
    });
  });

  describe('destroy note', function() {
    it('should remove note', async function() {
      await model.destroy('n1');
      const keys = await model.keylist();
      assert.exists(keys);
      assert.lengthOf(keys, 2);
      for(let key of keys) {
        assert.match(key, /n[23]/, 'correct key');
      }
    });
    it('should fail to remove nonexistent note', async function() {
      try {
        await model.destroy('nonexistent_key');
        throw new Error('should not get here');
      } catch(err) {
        assert.notEqual(err.message, 'should not get here');
      }
    });
  });

  after(function() { model.close(); });
});
