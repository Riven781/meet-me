import { insertPost, getPostById } from "../repository/posts.repository.js";
import { AppError } from "../errors/AppError.js";
import ERROR_CODES from "../constants/errorCodes.js";
import { getPostData } from "../utils/formatData.js";
import { decodeCursor, encodeCursor } from "../utils/cursor.js";
import { getPosts } from "../repository/posts.repository.js";
import { getPostsByUsername } from "../repository/posts.repository.js";
import { deletePostById } from "../repository/posts.repository.js";
import { setReaction } from "../repository/posts.repository.js";
import { updatePost } from "../repository/posts.repository.js";

export async function createPost(userId, text) {
  const postId = await insertPost({ user_id: userId, text });

  if (!postId) {
    throw new AppError(ERROR_CODES.POST_NOT_CREATED, 500);
  }

  let postData = null;
  try{
    postData = await getPostById(postId, userId);
  }
  catch {
    // zapis poprawny ale nie otrrzymaliśmy zapisanych danych
  }

  return {
    postId,
    postData: postData ? getPostData(postData) : null,
  }
}


export async function getFeed(userId, limit = 20, lastPostCursor = null) {
  let cursorObj = null;
  if(lastPostCursor){
    cursorObj = decodeCursor(lastPostCursor);
  }

  const rows = await getPosts(userId, limit, cursorObj);

  const posts = rows.map(post => getPostData(post));

  const nextPostCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id,
  }) : null;

  return { posts, nextPostCursor };
}


export async function getPostsByUser(userId, username, limit = 20, lastPostCursor = null) {

  let cursorObj = null;
  if (lastPostCursor) {
    cursorObj = decodeCursor(lastPostCursor);
  }

  const rows = await getPostsByUsername(userId, username, limit, cursorObj);

  const posts = rows.map(post => getPostData(post));

  const nextPostCursor = rows.length === limit ? encodeCursor({
    lastCreatedAt: rows[rows.length - 1].created_at,
    lastId: rows[rows.length - 1].id,
  }) : null;

  return { posts, nextPostCursor };

}

export async function deletePost(postId, username) {

 const post = await getPostById(postId);

  if (!post) {
    throw new AppError(ERROR_CODES.POST_NOT_FOUND, 404);
  }


  if (post.username !== username) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 403);
  }

  const deleted = await deletePostById(postId); 
  if(!deleted){
    throw new AppError(ERROR_CODES.POST_NOT_DELETED, 404);
  }
}

export async function setReactionToPost(userId, postId, reactionType) {
  const reaction = await setReaction({ userId, postId, reactionType });
  return {reaction}
}

export async function editPost(postId, userId, text) {
  

  const post = await getPostById(postId, userId);

  if (!post) {
    throw new AppError(ERROR_CODES.POST_NOT_FOUND, 404);
  }
  
  const edited = await updatePost(postId, text);

  if (!edited) {
    throw new AppError(ERROR_CODES.POST_NOT_EDITED, 500);
  }

  let updatedPost = null;
  try {
    updatedPost = await getPostById(postId, userId);
  } catch {
    console.log('error');
    updatedPost = null;
  }

  console.log(`updatedPost: ${JSON.stringify(updatedPost)}`);

  return {
    postData: updatedPost ? getPostData(updatedPost) : null
  }
}
