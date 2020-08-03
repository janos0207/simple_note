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
});
