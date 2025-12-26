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
  return res.id;
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