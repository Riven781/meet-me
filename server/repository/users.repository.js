import db from "../db.js";


export async function getAllUsers() {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
}


export async function createUser({ username, email, password, first_name, last_name }) {
  const [res] = await db.execute(
    `INSERT INTO Users (username, email, password, first_name, last_name)
    VALUES (?, ?, ?, ?, ?)`,
    [username, email, password, first_name, last_name]
  );
  console.log(res);
  return res.insertId;
}

export async function getUserByEmailAndPassword(email, password) {
  const [rows] = await db.query('SELECT id, username FROM Users WHERE email = ? AND password = ?', [email, password]);
  console.log(rows);
  return rows[0];
}

export async function getUserByUsernameAndPassword(username, password) {
  const [rows] = await db.query('SELECT id, username FROM Users WHERE username = ? AND password = ?', [username, password]);
  console.log(rows);
  return rows[0];
}

export async function getUserById(id) {
  const [rows] = await db.query('SELECT username FROM Users WHERE id = ?', [id]);
  return rows[0];
}




export async function findUserByUsername(username){
  const [rows] = await db.query('SELECT id, username, avatar_img_url, background_img_url FROM Users WHERE username = ?', [username]);
  return rows[0];
}

export async function saveAvatarImgUrl(userId, imageUrl){
  const [res] = await db.query(`UPDATE Users SET avatar_img_url = ? WHERE id = ?`, [imageUrl, userId]);
  return res.affectedRows === 1;
}

export async function saveBackgroundImgUrl(userId, imageUrl){
  const [res] = await db.query(`UPDATE Users SET background_img_url = ? WHERE id = ?`, [imageUrl, userId]);
  return res.affectedRows === 1;
}