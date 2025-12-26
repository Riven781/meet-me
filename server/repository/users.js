import db from "../db.js";


export async function getAllUsers() {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
}


export async function createUser({username, email, password, first_name, last_name}){
  const [res] = await db.execute(
    `INSERT INTO Users (username, email, password, first_name, last_name)
    VALUES (?, ?, ?, ?, ?)`,
    [username, email, password, first_name, last_name]
  );
  console.log(res);
  return res.insertId;
}

export async function getUserByEmailAndPassword(email, password) {
  const [rows] = await db.query('SELECT id FROM Users WHERE email = ? AND password = ?', [email, password]);
  console.log(rows);
  return rows[0];
}

export async function getUserByUsernameAndPassword(username, password) {
  const [rows] = await db.query('SELECT id FROM Users WHERE username = ? AND password = ?', [username, password]);
  console.log(rows);
  return rows[0];
}

export async function getUserById(id){
  const [rows] = await db.query('SELECT username FROM Users WHERE id = ?', [id]);
  return rows[0];
}


export async function insertPost({user_id, text}) {
  const [res] = await db.execute(
    `INSERT INTO Posts (user_id, text)
    VALUES (?, ?)`,
    [user_id, text]
  );
  return res.insertId;
}


export async function getPostById(id) {
  const [rows] = await db.query(`
    SELECT Posts.id, username, text, Posts.created_at, like_count, dislike_count, heart_count, reply_count FROM Posts
    INNER JOIN Users ON Posts.user_id = Users.id
    WHERE Posts.id = ?`
  , [id]);
  return rows[0];
}