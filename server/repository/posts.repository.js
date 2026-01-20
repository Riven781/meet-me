import db from "../db.js";
import { encodeCursor } from '../utils/cursor.js';


export async function insertPost({ user_id, text }) {
  const [res] = await db.execute(
    `INSERT INTO Posts (user_id, text)
    VALUES (?, ?)`,
    [user_id, text]
  );
  return res.insertId;
}


export async function getPostById(id, userId) {
  const [rows] = await db.query(`
    SELECT UNIX_TIMESTAMP(Posts.created_at) * 1000 AS createdAt, UNIX_TIMESTAMP(last_modified_at) * 1000 AS lastModifiedAt, Posts.id, username, text, Posts.created_at, like_count, dislike_count, heart_count, reply_count, last_modified_at, avatar_img_url, Users.id = ? AS isCreatedByUser, edited FROM Posts
    INNER JOIN Users ON Posts.user_id = Users.id
    WHERE Posts.id = ?`
    , [userId, id]);
  return rows[0];
}




export async function getPosts(userId, limit = 20, lastPostCursor = null) {
  let rows;
  if (!lastPostCursor) {
    [rows] = await db.query(`
      SELECT UNIX_TIMESTAMP(Posts.created_at) * 1000 AS createdAt, UNIX_TIMESTAMP(last_modified_at) * 1000 AS lastModifiedAt, Posts.id, username,  text, Posts.created_at, like_count, dislike_count, heart_count, reaction, reply_count, avatar_img_url, last_modified_at, edited FROM Posts
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
      SELECT UNIX_TIMESTAMP(Posts.created_at) * 1000 AS createdAt, UNIX_TIMESTAMP(last_modified_at) * 1000 AS lastModifiedAt, Posts.id, username, text, Posts.created_at, like_count, dislike_count, heart_count, avatar_img_url, reaction, reply_count, last_modified_at, edited FROM Posts
      INNER JOIN Users ON Posts.user_id = Users.id
      LEFT JOIN PostsReactions ON Posts.id = PostsReactions.post_id AND PostsReactions.user_id = ?
      WHERE Users.id != ? AND (Posts.created_at < ? OR (Posts.created_at = ? AND Posts.id < ?))
      ORDER BY Posts.created_at DESC, Posts.id DESC
      LIMIT ?`
      , [userId, userId, lastCreatedAt, lastCreatedAt, lastId, limit]);
  }

  console.log(` rows: ${rows}`);
  console.log(` rows.length: ${rows.length}`);

 /* const nextPostCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id
  }) : null;*/
 

  return rows;
}

//zaczynamy od najnowszych postów i idziemy do starszych (gdyby posty były stworozne tego samego dnia to i tak różni ich id)



export async function getPostsByUsername(userId, username, limit = 20, lastPostCursor = null) {
  let rows;
  if (!lastPostCursor) {
    [rows] = await db.query(`
     SELECT UNIX_TIMESTAMP(Posts.created_at) * 1000 AS createdAt, UNIX_TIMESTAMP(last_modified_at) * 1000 AS lastModifiedAt, Posts.id, username, text, Posts.created_at, like_count, dislike_count, avatar_img_url, heart_count, reaction, reply_count, Users.id = ? AS isCreatedByUser, edited, last_modified_at FROM Posts 
     INNER JOIN Users ON Posts.user_id = Users.id
     LEFT JOIN PostsReactions ON Posts.id = PostsReactions.post_id AND PostsReactions.user_id = ?
     WHERE Users.username = ?
     ORDER BY Posts.created_at DESC, Posts.id DESC
     LIMIT ?`
      , [userId, userId, username, limit]);
  }
  else {
    const { lastCreatedAt, lastId } = lastPostCursor;
    [rows] = await db.query(`
     SELECT UNIX_TIMESTAMP(Posts.created_at) * 1000 AS createdAt, UNIX_TIMESTAMP(last_modified_at) * 1000 AS lastModifiedAt, Posts.id, username, text, Posts.created_at, like_count, dislike_count, avatar_img_url, heart_count, reaction, reply_count, Users.id = ? AS isCreatedByUser, edited, last_modified_at FROM Posts 
     INNER JOIN Users ON Posts.user_id = Users.id
     LEFT JOIN PostsReactions ON Posts.id = PostsReactions.post_id AND PostsReactions.user_id = ?
     WHERE Users.username = ? AND (Posts.created_at < ? OR (Posts.created_at = ? AND Posts.id < ?))
     ORDER BY Posts.created_at DESC, Posts.id DESC
     LIMIT ?`
      , [userId, userId, username, lastCreatedAt, lastCreatedAt, lastId, limit]);
  }

  /*const nextPostCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id
  }) : null;*/
  return rows;

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


export async function deletePostById(postId) {
  const [res] = await db.query(`DELETE FROM Posts WHERE id = ?`, [postId]);
  return res.affectedRows === 1;
}


export async function updatePost(postId, text) {
  const [res] = await db.query(`UPDATE Posts SET text = ?, last_modified_at = NOW(), edited = TRUE WHERE id = ?`, [text, postId]);
  return res.affectedRows === 1;
}