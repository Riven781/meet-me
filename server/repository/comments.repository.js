import db from '../db.js';
import { encodeCursor } from './../utils/cursor.js';


//UNIX_TIMESTAMP(Comments.created_at) * 1000 AS createdAt -- zwraca czas w milisekundach
export async function getComments(postId, userId, limit = 20, lastCommentCursor = null) {
  let rows;
  if (!lastCommentCursor) {
    [rows] = await db.query(`
      SELECT UNIX_TIMESTAMP(Comments.created_at) * 1000 AS createdAt, Comments.id, CommentHearts.id AS heart_id, username, content, avatar_img_url, Comments.created_at, heart_count, reply_count, parent_id  FROM Comments
      INNER JOIN Users ON Comments.user_id = Users.id
      LEFT JOIN CommentHearts ON Comments.id = CommentHearts.comment_id AND CommentHearts.user_id = ?
      WHERE Comments.post_id = ? AND Comments.parent_id IS NULL
      ORDER BY Comments.created_at DESC, Comments.id DESC
      LIMIT ?`
      , [ userId, postId, limit]);
  }
  else {
    const { lastCreatedAt, lastId } = lastCommentCursor;
    [rows] = await db.query(`
      SELECT UNIX_TIMESTAMP(Comments.created_at) * 1000 AS createdAt, Comments.id, CommentHearts.id AS heart_id, username, content, avatar_img_url, Comments.created_at, heart_count, reply_count, parent_id  FROM Comments
      INNER JOIN Users ON Comments.user_id = Users.id
      LEFT JOIN CommentHearts ON Comments.id = CommentHearts.comment_id AND CommentHearts.user_id = ?
      WHERE (Comments.post_id = ? AND Comments.parent_id IS NULL) AND (Comments.created_at < ? OR (Comments.created_at = ? AND Comments.id < ?))
      ORDER BY Comments.created_at DESC, Comments.id DESC
      LIMIT ?`
      , [userId, postId, lastCreatedAt, lastCreatedAt, lastId, limit]);
  }

  /*const nextCommentCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id
  }) : null;*/

  return rows;
}

export async function getReplies(userId, parentId, limit = 20, lastCommentCursor = null) {
  let rows;
  if (!lastCommentCursor) {
    [rows] = await db.query(`
      SELECT UNIX_TIMESTAMP(Comments.created_at) * 1000 AS createdAt, Comments.id, CommentHearts.id AS heart_id, username, content,avatar_img_url, Comments.created_at, heart_count, reply_count, parent_id  FROM Comments
      INNER JOIN Users ON Comments.user_id = Users.id
      LEFT JOIN CommentHearts ON Comments.id = CommentHearts.comment_id AND CommentHearts.user_id = ?
      WHERE Comments.parent_id = ?
      ORDER BY Comments.created_at ASC, Comments.id ASC
      LIMIT ?`
      , [userId, parentId, limit]);
  }
  else {
    const { lastCreatedAt, lastId } = lastCommentCursor;
    [rows] = await db.query(`
      SELECT UNIX_TIMESTAMP(Comments.created_at) * 1000 AS createdAt, Comments.id,  CommentHearts.id AS heart_id, username, content, avatar_img_url, Comments.created_at, heart_count, reply_count, parent_id  FROM Comments
      INNER JOIN Users ON Comments.user_id = Users.id
      LEFT JOIN CommentHearts ON Comments.id = CommentHearts.comment_id AND CommentHearts.user_id = ?
      WHERE (Comments.parent_id = ?) AND (Comments.created_at > ? OR (Comments.created_at = ? AND Comments.id > ?))
      ORDER BY Comments.created_at ASC, Comments.id ASC
      LIMIT ?`
      , [userId, parentId, lastCreatedAt, lastCreatedAt, lastId, limit]);
  }

  //console.log(`oooooo rows: ${JSON.stringify(rows)}`);

  /*const nextCommentCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id
  }) : null;*/

  return rows;
}



export async function insertComment({ user_id, post_id, content, parent_id = null }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.execute(
      `INSERT INTO Comments (user_id, post_id, content, parent_id)
      VALUES (?, ?, ?, ?)`,
      [user_id, post_id, content, parent_id]
    );

    if (parent_id !== null) {
      await conn.execute(
        `UPDATE Comments
        SET reply_count = reply_count + 1
        WHERE id = ?`,
        [parent_id]
      );
    }

    await conn.execute(
      `UPDATE Posts
      SET reply_count = reply_count + 1
      WHERE id = ?`,
      [post_id]
    );
    await conn.commit();
    return res.insertId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
}

export async function getCommentById(id) {
  const [rows] = await db.query(`
    SELECT UNIX_TIMESTAMP(Comments.created_at) * 1000 AS createdAt, Comments.id, CommentHearts.id AS heart_id, Comments.user_id, username, avatar_img_url, content, Comments.created_at, heart_count, reply_count, parent_id  FROM Comments
    INNER JOIN Users ON Comments.user_id = Users.id
    LEFT JOIN CommentHearts ON Comments.id = CommentHearts.comment_id
    WHERE Comments.id = ?`
    , [id]);
  return rows[0];
}



export async function likeComment(user_id, comment_id) {
  console.log(`likeComment(${user_id}, ${comment_id})`);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.execute(
      `
      INSERT IGNORE INTO CommentHearts (user_id, comment_id) VALUES (?, ?)`
      ,
      [user_id, comment_id]
    );

    const added = res.affectedRows === 1;

    if (added) {
      await conn.execute(
        `UPDATE Comments
      SET heart_count = heart_count + 1
      WHERE id = ?`,
        [comment_id]
      );
    }

    await conn.commit();
    return {added};
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
}


export async function unlikeComment(user_id, comment_id) {
  console.log(`unlikeComment(${user_id}, ${comment_id})`);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.execute(
      `
      DELETE FROM CommentHearts
      WHERE user_id = ? AND comment_id = ?
      `,
      [user_id, comment_id]
    );

    const removed = res.affectedRows === 1;


    if (res.affectedRows === 1) {
      await conn.execute(
        `UPDATE Comments
      SET heart_count = heart_count - 1
      WHERE id = ?`,
        [comment_id]
      );
    }

    await conn.commit();
    return { removed};
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
}

