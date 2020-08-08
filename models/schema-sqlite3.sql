CREATE TABLE IF NOT EXISTS notes (
  notekey VARCHAR(255),
  title VARCHAR(255),
  body TEXT,
  createdAt DATETIME,
  updatedAt DATETIME,
  PRIMARY KEY(notekey)
);
