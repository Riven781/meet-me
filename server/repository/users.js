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


export async function getPosts(userId, limit = 20, lastPostCursor = null) {
  let rows;
  if (!lastPostCursor){
    [rows] = await db.query(`
      SELECT Posts.id, username, text, Posts.created_at, like_count, dislike_count, heart_count, reply_count FROM Posts
      INNER JOIN Users ON Posts.user_id = Users.id
      WHERE Users.id != ?
      ORDER BY Posts.created_at DESC, Posts.id DESC
      LIMIT ?`
    , [userId, limit]);
  }
  else{
    const {lastCreatedAt, lastId} = lastPostCursor;
    [rows] = await db.query(`
      SELECT Posts.id, username, text, Posts.created_at, like_count, dislike_count, heart_count, reply_count FROM Posts
      INNER JOIN Users ON Posts.user_id = Users.id
      WHERE Users.id != ? AND (Posts.created_at < ? OR (Posts.created_at = ? AND Posts.id < ?))
      ORDER BY Posts.created_at DESC, Posts.id DESC
      LIMIT ?`
    , [userId, lastCreatedAt, lastCreatedAt, lastId,  limit]);
  }

  console.log(` rows: ${rows }`);
  console.log(` rows.length: ${rows.length }`);

  const nextPostCursor = rows.length === limit ?encodeCursor({
    lastCreatedAt: rows[rows.length -1].created_at,
    lastId: rows[rows.length -1].id
  }) : null;
  console.log(` nextPostCursor: ${nextPostCursor }`);
  return {
    posts: rows,
    nextPostCursor
  };
}

//zaczynamy od najnowszych postów i idziemy do starszych (gdyby posty były stworozne tego samego dnia to i tak różni ich id)

function encodeCursor({lastCreatedAt, lastId}) {
  const cursorStr = JSON.stringify({lastCreatedAt, lastId});
  return Buffer.from(cursorStr).toString('base64');
}

