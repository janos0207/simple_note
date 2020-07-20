const _noteKey = Symbol('key');
const _noteTitle = Symbol('title');
const _noteBody = Symbol('body');

export default class Note {
  constructor(key, title, body) {
    this[_noteKey] = key;
    this[_noteTitle] = title;
    this[_noteBody] = body;
  }

  get key() {
    return this[_noteKey];
  }
  get title() {
    return this[_noteTitle];
  }
  set title(newTitle) {
    this[_noteTitle] = newTitle;
  }
  get body() {
    return this[_noteBody];
  }
  set body(newBody) {
    this[_noteBody] = newBody;
  }

  get JSON() {
    return JSON.stringify({
      key: this.key, title: this.title, body: this.body,
    });
  }

  static fromJSON(json) {
    const data = JSON.parse(json);
    const note = new Note(data.key, data.title, data.body);
    return note;
  }
}
