import { AppError } from "../errors/AppError.js";
import ERROR_CODES from "../constants/errorCodes.js";
import { getCommentData } from "../utils/formatData.js";
import { getCommentById, getComments, getReplies, insertComment, likeComment, unlikeComment } from "../repository/comments.repository.js";
import { decodeCursor, encodeCursor } from "../utils/cursor.js";


export async function getCommentsForPost(userId, postId, limit = 20, lastCommentCursor = null) {
  let cursorObj = null;
  if (lastCommentCursor) {
    cursorObj = decodeCursor(lastCommentCursor);
  }

  const rows = await getComments(postId, userId, limit, cursorObj);

  const comments = rows.map(comment => getCommentData(comment));

  const nextCommentCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id,
  }) : null;
 
  return { comments, nextCommentCursor };
}


export async function getRepliesForComment(userId, parentId, limit = 20, lastCommentCursor = null) {

  let cursorObj = null;
  if (lastCommentCursor) {
    cursorObj = decodeCursor(lastCommentCursor);
  }

  const rows = await getReplies(userId, parentId, limit, cursorObj);
  const comments = rows.map(comment => getCommentData(comment));

  const nextCommentCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id,
  }) : null;

  return { comments, nextCommentCursor };
}


export async function publishComment(userId, postId, content, parentId = null, replyToCommentId = null) {
  
  if (replyToCommentId != null) {
    try {
      const commentReply = await getCommentById(replyToCommentId);
      if(commentReply){
        const authorId = commentReply.user_id;
      if (authorId !== userId) {
        console.log(` authorId: ${authorId}, userId: ${userId}`);
        content = `@${commentReply.username} ${content}`;
      }
      }
      
    } catch{
      throw new AppError(ERROR_CODES.REPLY_TO_COMMENT_FAILED, 400);
    }
  }

  const commentId = await insertComment({ user_id: userId, post_id: postId, content, parent_id: parentId });
  
  if (!commentId) {
    throw new AppError(ERROR_CODES.COMMENT_NOT_CREATED, 500);
  }

  let comment = null;
  try {
    comment = await getCommentById(commentId);
  } catch {
    comment = null;
  }

  return {
    commentId,
    comment: comment ? getCommentData(comment) : null
  };
}


export async function addCommentLike(userId, commentId) {
  const { added } = await likeComment(userId, commentId);

  return {
    commentId,
    added
  };
}

export async function removeCommentLike(userId, commentId) {
  const { removed} = await unlikeComment(userId, commentId);

  return {
    commentId,
    removed
  };
  
}