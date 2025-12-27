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
  const [rows] = await db.query('SELECT id FROM Users WHERE email = ? AND password = ?', [email, password]);
  console.log(rows);
  return rows[0];
}

export async function getUserByUsernameAndPassword(username, password) {
  const [rows] = await db.query('SELECT id FROM Users WHERE username = ? AND password = ?', [username, password]);
  console.log(rows);
  return rows[0];
}

export async function getUserById(id) {
  const [rows] = await db.query('SELECT username FROM Users WHERE id = ?', [id]);
  return rows[0];
}


export async function insertPost({ user_id, text }) {
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
  if (!lastPostCursor) {
    [rows] = await db.query(`
      SELECT Posts.id, username, text, Posts.created_at, like_count, dislike_count, heart_count, reaction, reply_count FROM Posts
      INNER JOIN Users ON Posts.user_id = Users.id
      LEFT JOIN PostsReactions ON Posts.id = PostsReactions.post_id AND PostsReactions.user_id = ?
      WHERE Users.id != ?
      ORDER BY Posts.created_at DESC, Posts.id DESC
      LIMIT ?`
      , [userId, userId, limit]);
  }
  else {
    const { lastCreatedAt, lastId } = lastPostCursor;
    [rows] = await db.query(`
      SELECT Posts.id, username, text, Posts.created_at, like_count, dislike_count, heart_count, reaction, reply_count FROM Posts
      INNER JOIN Users ON Posts.user_id = Users.id
      LEFT JOIN PostsReactions ON Posts.id = PostsReactions.post_id AND PostsReactions.user_id = ?
      WHERE Users.id != ? AND (Posts.created_at < ? OR (Posts.created_at = ? AND Posts.id < ?))
      ORDER BY Posts.created_at DESC, Posts.id DESC
      LIMIT ?`
      , [userId, userId, lastCreatedAt, lastCreatedAt, lastId, limit]);
  }

  console.log(` rows: ${rows}`);
  console.log(` rows.length: ${rows.length}`);

  const nextPostCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id
  }) : null;
  console.log(` nextPostCursor: ${nextPostCursor}`);
  return {
    posts: rows,
    nextPostCursor
  };
}

//zaczynamy od najnowszych postów i idziemy do starszych (gdyby posty były stworozne tego samego dnia to i tak różni ich id)

function encodeCursor({ lastCreatedAt, lastId }) {
  const cursorStr = JSON.stringify({ lastCreatedAt, lastId });
  return Buffer.from(cursorStr).toString('base64');
}


export async function setReaction({ userId, postId, reactionType }) {
  const conn = await db.getConnection();
  let oldReaction = 0;
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `SELECT reaction FROM PostsReactions
      WHERE user_id = ? AND post_id = ?
      FOR UPDATE`,
      [userId, postId]
    );

    oldReaction = rows.length ? rows[0].reaction : 0;

    if (rows.length === 0) {

      if (reactionType === 0) {
        await conn.rollback();
        return reactionType;
      }

      await conn.execute(
        `INSERT INTO PostsReactions (user_id, post_id, reaction)
        VALUES (?, ?, ?)`,
        [userId, postId, reactionType]
      );

      await changeCounter(conn, postId, reactionType, 1);
      await conn.commit();
      return reactionType;

    }


    if (oldReaction === reactionType) {
      await conn.rollback();
      return oldReaction;
    }

    if (reactionType === 0) {
      await conn.execute(
        `DELETE FROM PostsReactions
          WHERE user_id = ? AND post_id = ?`,
        [userId, postId]
      );
      await changeCounter(conn, postId, oldReaction, -1);
      await conn.commit();
      return reactionType;
    }


    await conn.execute(
      `UPDATE PostsReactions
        SET reaction = ?
        WHERE user_id = ? AND post_id = ?`,
      [reactionType, userId, postId]
    );

    await changeCounter(conn, postId, oldReaction, -1);
    await changeCounter(conn, postId, reactionType, 1);



    await conn.commit();
    return reactionType;
  } catch (error) {
    try {
      await conn.rollback();
    } catch { };

    try {
      const [rows2] = await conn.execute(
        `SELECT reaction
         FROM PostsReactions
         WHERE user_id = ? AND post_id = ?`,
        [userId, postId]
      );
      return rows2.length ? rows2[0].reaction : 0;
    } catch {
     
      return oldReaction;
    }
  } finally {
    await conn.release();
  }
}


async function changeCounter(conn, postId, reactionType, delta) {
  if (reactionType === 1) {
    await conn.execute(
      `UPDATE Posts SET heart_count = heart_count + ? WHERE id = ?`,
      [delta, postId]
    );
  } else if (reactionType === 2) {
    await conn.execute(
      `UPDATE Posts SET like_count = like_count + ? WHERE id = ?`,
      [delta, postId]
    );
  } else if (reactionType === 3) {
    await conn.execute(
      `UPDATE Posts SET dislike_count = dislike_count + ? WHERE id = ?`,
      [delta, postId]
    );
  }
}

