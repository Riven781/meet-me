import { createPost, deletePost, editPost, getFeed, getPostsByUser, setReactionToPost } from "../service/posts.service.js";


export async function createPostController(req, res, next) {
  try {
    const userId = req.session.userId;
    const { text } = req.body;

    const data = await createPost(userId, text);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}


export async function getPostsController(req, res, next) {
  try {

    console.log(`req.query: ${JSON.stringify(req.query)}`);
    const userId = req.session.userId;
    const limit = Number(req.query.limit) || 20;
    const { username, lastPostCursor } = req.query;

    const data = username
      ? await getPostsByUser(userId, username, limit, lastPostCursor)
      : await getFeed(userId, limit, lastPostCursor);

    res.json(data);
  } catch (err) {
    next(err);
  }
}


export async function editPostController(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    const userId = req.session.userId;
    const { content } = req.body;

    const data = await editPost(postId, userId, content);


    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deletePostController(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    const username = req.session.username;

    await deletePost(postId, username);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

export async function setReactionController(req, res, next) {
  try {
    const userId = req.session.userId;
    const { postId, reactionType } = req.body;
    //await new Promise(r => setTimeout(r, Math.random() * 9200));
    const data = await setReactionToPost(userId, postId, reactionType);

    


    res.json(data);
  } catch (err) {
    next(err);
  }
}



