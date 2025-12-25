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