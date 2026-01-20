import { addCommentLike, getCommentsForPost, getRepliesForComment, publishComment, removeCommentLike } from "../service/comments.service.js";

export async function publishCommentController(req, res, next) {
  try {
    const userId = req.session.userId;
    const { postId, content, parentId, replyToCommentId } = req.body;

    console.log(`req.body: ${JSON.stringify(req.body)}`);

    const data = await publishComment(
      userId,
      postId,
      content,
      parentId,
      replyToCommentId
    );

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getCommentsController(req, res, next) {
  try {
    const userId = req.session.userId;

    const postId = req.query.postId ? Number(req.query.postId) : null;
    const parentId = req.query.parentId ? Number(req.query.parentId) : null;

    const limit = Number(req.query.limit) || 20;
    const lastCommentCursor = req.query.lastCommentCursor ?? null;

    const data = parentId
      ? await getRepliesForComment(userId, parentId, limit, lastCommentCursor)
      : await getCommentsForPost(userId, postId, limit, lastCommentCursor);

    res.json(data);
  } catch (err) {
    next(err);
  }
}





export async function addCommentLikeController(req, res, next) {
  try {
    const userId = req.session.userId;
    const commentId = Number(req.params.commentId);

    await addCommentLike(userId, commentId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}


export async function removeCommentLikeController(req, res, next) {
  try {
    const userId = req.session.userId;
    const commentId = Number(req.params.commentId);

    await removeCommentLike(userId, commentId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}


