import { fetchComments, fetchReplies, likeComment, unlikeComment, postComment } from "../api/comments.api.js";
import { createComment, renderNewComments, setHeartUI } from "../components/comments.components.js";
import { appModel } from "../models/appModel.js";
import { createReply, renderNewReplies } from "../components/replies.components.js";


function ensureCommentsState(postId) {
  let state = appModel.commentsByPostId[postId];

  if (!state) {
    state = {
      items: [],
      isLoading: false,
      end: false,
      nextCommentCursor: null,
    };
    appModel.commentsByPostId[postId] = state;
  }

  return state;
}

export async function loadComments(postId, postEl, firstLoad = false, limit = 5) {
  const state = ensureCommentsState(postId);

  if (state.isLoading || state.end) return;

  state.isLoading = true;


  try {
    const data = await fetchComments({
      postId,
      limit,
      lastCommentCursor: state.nextCommentCursor,
    });

    state.nextCommentCursor = data.nextCommentCursor ?? null;
    if (!state.nextCommentCursor) state.end = true;

    const incoming = data.comments ?? [];
    const newComments = incoming.filter(c => !appModel.commentsById[c.id]);

    for (const c of newComments) {
      appModel.commentsById[c.id] = c;
    }

    state.items.push(...newComments);

    renderNewComments(newComments, postEl, firstLoad, state.end);
  } catch (e) {

    console.error(e);
  } finally {
    state.isLoading = false;
  }
}

export function resetCommentsController(postId) {
  delete appModel.commentsByPostId[postId];
}



function ensureRepliesState(commentId) {
  let state = appModel.repliesByCommentId[commentId];

  if (!state) {
    state = {
      items: [],
      isLoading: false,
      error: null,
      end: false,
      nextCommentCursor: null,
    };
    appModel.repliesByCommentId[commentId] = state;
  }

  return state;
}

//end mowi ze juz wszystko załadowane

export async function loadReplies(postId, commentId, commentEl, limit = 5) {
  const state = ensureRepliesState(commentId);

  if (state.isLoading || state.end) return;

  state.isLoading = true;

  try {
    const data = await fetchReplies({
      postId,
      parentId: commentId,
      limit,
      lastCommentCursor: state.nextCommentCursor,
    });

    state.nextCommentCursor = data.nextCommentCursor ?? null;
    if (!state.nextCommentCursor) state.end = true;

    const incoming = data.comments ?? [];
    const newReplies = incoming.filter(r => !appModel.commentsById[r.id]);

    for (const r of newReplies) {
      appModel.commentsById[r.id] = r;
    }

    state.items.push(...newReplies);

    renderNewReplies(newReplies, commentEl, state.end);
  } catch (e) {
    console.error(e);
  } finally {
    state.isLoading = false;
  }
}

export function resetRepliesController(commentId) {
  delete appModel.repliesByCommentId[commentId];
}



function resetTextarea(textarea) {
  textarea.value = "";
  textarea.style.height = "auto";
}

export async function onCommentSubmit(postId, postEl, textarea) {
  if (!textarea) return;

  const content = textarea.value.trim();
  if (!content) return;

  if (!postId) return;

  const replyMeta = appModel.postsById?.[postId]?.replyToComment;

  const body = replyMeta
    ? {
      postId,
      content,
      parentId: replyMeta.parentId,
      replyToCommentId: replyMeta.replyToCommentId,
    }
    : { postId, content };

  try {
    const data = await postComment(body);
    const comment = data?.comment;
    if (!comment) {
      console.error("No comment data returned from server");
      return;
    }

    resetTextarea(textarea);

    appModel.commentsById[comment.id] = comment;

    if (comment.parentId) {
      const parentId = comment.parentId;
      const repliesState = ensureRepliesState(parentId);

      repliesState.items.push(comment);

      const parentCommentEl = postEl.querySelector(
        `.comment-container[data-comment-id="${parentId}"]`
      );
      if (!parentCommentEl) return;

      const replyContainer = parentCommentEl.querySelector(".comments-replies");
      if (!replyContainer) return;

      replyContainer.classList.add("active");

      const newReplyEl = createReply(comment);

      const anchorId = replyMeta?.replyToCommentId;
      const replyBefore = anchorId
        ? postEl.querySelector(`.comment-reply[data-comment-id="${anchorId}"]`)
        : null;

      if (replyBefore && replyBefore.parentElement === replyContainer) {
        replyContainer.insertBefore(newReplyEl, replyBefore.nextSibling);
      } else {
        replyContainer.appendChild(newReplyEl);
      }
    } else {
      const commentsState = ensureCommentsState(postId);
      commentsState.items.push(comment);

      const container = postEl.querySelector(".comments");
      if (!container) return;

      const newCommentEl = createComment(comment);

      container.insertBefore(newCommentEl, textarea.parentElement.nextSibling);
    }
  } catch (e) {
    console.error("Create comment failed:", e);
  }
}





export async function toggleCommentHeartController(btnEl) {
  const commentEl = btnEl.closest(".comment-container");
  const replyEl = btnEl.closest(".comment-reply");

  const commentId = replyEl?.dataset?.commentId || commentEl?.dataset?.commentId;
  if (!commentId) return;

  const comment = appModel.commentsById[commentId];
  if (!comment) return;

  const counterEl = btnEl.nextElementSibling;
  if (!counterEl) return;

  if (comment.isLoading) return;
  comment.isLoading = true;

  const prevLiked = Boolean(comment.isLiked);
  const prevCount = Number(comment.commentHearts) || 0;

  const nextLiked = !prevLiked;
  const nextCount = prevCount + (nextLiked ? 1 : -1);

  comment.isLiked = nextLiked;  //optyzmisztyczne  zalozenie
  comment.commentHearts = nextCount;
  setHeartUI(btnEl, counterEl, nextLiked, nextCount);

  //todo: dodaj pulsowanie do serca, jesli długo sie łąduje

  try {
    if (nextLiked) {
      await likeComment(commentId);
    } else {
      await unlikeComment(commentId);
    }
  } catch (e) {
    comment.isLiked = prevLiked;
    comment.commentHearts = prevCount;
    setHeartUI(btnEl, counterEl, prevLiked, prevCount);
    console.error(e);
  } finally {
    comment.isLoading = false;
  }
}
