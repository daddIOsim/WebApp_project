'use strict';

const sqlite = require('sqlite3');
const crypto = require('crypto');

const db = new sqlite.Database('db.db', (err) => {
  if (err) throw err;
})


exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE user_id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        // by default, the local strategy looks for "username":
        const user = { user_id: row.user_id, username: row.username, IsLoyal: row.IsLoyal };
        resolve(user);
      }
    });
  });
};

exports.getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve(false); }
      else {
        const user = { user_id: row.user_id, username: row.username, IsLoyal: row.IsLoyal }

        const salt = row.salt;
        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
          if (err) reject(err);

          const passwordHex = Buffer.from(row.password, 'hex');

          if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
            resolve(false);
          else resolve(user);
        });
      }
    });
  });
};

