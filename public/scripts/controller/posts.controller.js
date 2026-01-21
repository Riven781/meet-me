import { deletePost, fetchPosts, publishPost, updatePost } from "../api/posts.api.js";
import { createPost, renderNewPosts } from "../components/posts.components.js";
import { appModel } from "../models/appModel.js";
import { formatDate } from "../utils/formatDate.js";
import { isElementNearViewportBottom } from "../utils/viewport.js";


let nextPostCursor = null;
let loading = false;
let end = false;

export async function loadPosts(endElement) {
  if (loading || end) return;
  loading = true;

  try {
    const data = await fetchPosts({
      limit: 5,
      lastPostCursor: nextPostCursor,
      username: appModel.username !== "" ? appModel.username : "",
    });

    nextPostCursor = data.nextPostCursor;

    if (!nextPostCursor) {
      end = true;
    }

    const newPosts = data.posts.filter(post => !appModel.postsById[post.id]) || [];
    //dodano filtracje

    appModel.posts.push(...newPosts);
    newPosts.forEach(post => {
      appModel.postsById[post.id] = post;
      appModel.postsById[post.id].confirmedReaction = post.liked ?? 0;

    })

    renderNewPosts(newPosts);

    requestAnimationFrame(() => {
      if (!end && isElementNearViewportBottom(endElement)) {
        loadPosts();
      }
    });
  } catch (error) {
    console.error(error);
  } finally {
    loading = false;
  }

}



export async function onPublishClick(textarea, postsContainer) {
  const maxHeight = 300;
  try {
    const result = await publishPost(textarea.value.trim());

    textarea.value = '';
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';


    appModel.posts.push(result.postData);
    appModel.postsById[result.postData.id] = result.postData;

    postsContainer.insertBefore(createPost(result.postData), postsContainer.firstChild);

  } catch (e) {
    console.error(e);
  }
}


export async function savePostEdit(postEl) {
  if (!postEl) return;

  const postId = postEl.dataset.postId;
  if (!postId) return;

  const p = postEl.querySelector(".post-content p");
  if (!p) return;

  const content = p.textContent ?? "";

  try {
    const data = await updatePost({ postId, content });
    const postData = data?.postData;
    if (!postData) return;

    appModel.postsById[postId].postText = postData.postText;


    p.textContent = postData.postText;
    p.contentEditable = "false";
    p.classList.remove("editable");

    const postDate = postEl.querySelector(".post-date");
    if (postDate) {
      postDate.textContent = `${formatDate(postData.lastModifiedAt)} (edited)`;
    }

    const editingContainer = postEl.querySelector(".editing-container");
    if (editingContainer) {
      editingContainer.style.display = "none";
    }
  } catch (e) {
    console.error(e);
  }
}





function cleanupPostFromModel(postId) {
  appModel.posts = appModel.posts.filter(p => String(p.id) !== String(postId));
  delete appModel.postsById[postId];

  // comments + replies cache for this post
  const commentsState = appModel.commentsByPostId[postId];
  if (commentsState?.items?.length) {
    for (const comment of commentsState.items) {
      const commentId = comment?.id;
      if (!commentId) continue;
      delete appModel.repliesByCommentId[commentId];
      delete appModel.commentsById[commentId];
    }
  }
  delete appModel.commentsByPostId[postId];
}

export async function onDeletePost(btnEl, { optionMenu } = {}) {
  const postEl = btnEl.closest(".post-container");
  if (!postEl) return;

  const postId = postEl.dataset.postId;
  if (!postId) return;

  try {
    await deletePost(postId);

    postEl.remove();

    cleanupPostFromModel(postId);

    if (optionMenu) optionMenu.postId = null;
  } catch (e) {
    console.error(e);
  }
}
