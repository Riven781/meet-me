const textarea = document.getElementById("post-text");
const postBtn = document.getElementById("post-btn");
const commentBtn = document.getElementsByClassName("comment-btn");

const maxHeight = 300;

postBtn.parentElement.classList.toggle('show', textarea.value.trim() !== '');

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';

  postBtn.parentElement.classList.toggle('show', textarea.value.trim() !== '');



});

textarea.addEventListener('focus', () => {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
});

window.addEventListener('resize', () => {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
});

async function loadPosts(){
  const res = await fetch('./../data/data.json');
  const posts = await res.json();

  const container =  document.querySelector('.posts');
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  posts.forEach(post => {
    const postElement = createPost(post);
    fragment.appendChild(postElement);
  });

  container.appendChild(fragment);
}

loadPosts();

async function loadComments(){
  const res = await fetch('./../data/comments.json');
  const comments = await res.json();

  const container =  document.querySelector('.comments');
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  comments.forEach(comment => {
    const commentElement = createComment(comment);
    fragment.appendChild(commentElement);
  });

  container.appendChild(fragment);
}

loadComments();


function createPost(post){
  const article = document.createElement('article');
  article.dataset.postId = post.id;
  const section = document.createElement('section');

  section.classList.add('post');
  article.appendChild(section);

  const postHeader = document.createElement('div');
  postHeader.classList.add('post-header');
  section.appendChild(postHeader);

  const authorContainer = document.createElement('div');
  authorContainer.classList.add('author-container');
  postHeader.appendChild(authorContainer);

  const authorImage = document.createElement('img');
  authorImage.src = "images/default-avatar.jpg";
  authorImage.alt = "image";
  authorImage.classList.add('author-image');
  authorContainer.appendChild(authorImage);

  const postInformation = document.createElement('div');
  postInformation.classList.add('post-information');
  authorContainer.appendChild(postInformation);

  const authorName = document.createElement('h2');
  authorName.classList.add('author-name');
  authorName.textContent = post.authorName;
  postInformation.appendChild(authorName);

  const postDate = document.createElement('div');
  postDate.classList.add('post-date');
  postDate.textContent = post.createdAt;
  postInformation.appendChild(postDate);

  const addBtn = document.createElement('button');
  addBtn.classList.add('add-btn');
  postHeader.appendChild(addBtn);
  addBtn.textContent = '➕';

  const postContentWrapper = document.createElement('div');
  postContentWrapper.classList.add('post-content-wrpapper');
  section.appendChild(postContentWrapper);

  const postContent = document.createElement('div');
  postContent.classList.add('post-content');
  postContentWrapper.appendChild(postContent);

  const postContentText = document.createElement('p');
  postContentText.textContent = post.postText;
  postContent.appendChild(postContentText);

  const postInteractions = document.createElement('div');
  postInteractions.classList.add('post-interactions');
  postContentWrapper.appendChild(postInteractions);

  const reactions = document.createElement('div');
  reactions.classList.add('reactions');
  postInteractions.appendChild(reactions);

  const interactionHeartWrapper = document.createElement('div');
  interactionHeartWrapper.classList.add('interaction-wrapper');
  interactionHeartWrapper.classList.add('reactions-wrapper');
  reactions.appendChild(interactionHeartWrapper);

  const heartBtn = document.createElement('button');
  heartBtn.classList.add('reaction-btn');
  heartBtn.classList.add('heart-btn');
  heartBtn.classList.add('interactions-btn');
  heartBtn.textContent = '❤️';
  interactionHeartWrapper.appendChild(heartBtn);

  const heartCount = document.createElement('span');
  heartCount.textContent = post.postHearts;
  interactionHeartWrapper.appendChild(heartCount);
 

  const interactionLikesWrapper = document.createElement('div');
  interactionLikesWrapper.classList.add('interaction-wrapper');
  interactionLikesWrapper.classList.add('reactions-wrapper');
  reactions.appendChild(interactionLikesWrapper);

  const likeBtn = document.createElement('button');
  likeBtn.classList.add('interactions-btn');
  likeBtn.classList.add('reaction-btn');
  likeBtn.classList.add('like-btn');
  interactionLikesWrapper.appendChild(likeBtn);
  likeBtn.textContent = '👍';

  const likeCount = document.createElement('span');
  likeCount.classList.add('like-count');
  likeCount.textContent = post.postLikes;
  interactionLikesWrapper.appendChild(likeCount);

  const interactionDislikesWrapper = document.createElement('div');
  interactionDislikesWrapper.classList.add('interaction-wrapper');
  interactionDislikesWrapper.classList.add('reactions-wrapper');
  reactions.appendChild(interactionDislikesWrapper);

  const dislikeBtn = document.createElement('button');
  dislikeBtn.classList.add('interactions-btn');
  dislikeBtn.classList.add('reaction-btn');
  interactionDislikesWrapper.appendChild(dislikeBtn);
  dislikeBtn.textContent = '👎';
  
  const dislikeCount = document.createElement('span');
  dislikeCount.textContent = post.postDislikes;
  interactionDislikesWrapper.appendChild(dislikeCount);


  const rightButtons = document.createElement('div');
  rightButtons.classList.add('right-buttons');
  postInteractions.appendChild(rightButtons);

  const saveBtn = document.createElement('button');
  saveBtn.classList.add('interactions-btn');
  saveBtn.classList.add('save-btn');
  rightButtons.appendChild(saveBtn);
  saveBtn.textContent = '📌';

  const interactionCommentsWrapper = document.createElement('div');
  interactionCommentsWrapper.classList.add('interaction-wrapper');
  
  rightButtons.appendChild(interactionCommentsWrapper);

  const commentBtn = document.createElement('button');
  commentBtn.classList.add('interactions-btn');
  commentBtn.classList.add('comment-btn');
  interactionCommentsWrapper.appendChild(commentBtn);
  commentBtn.textContent = '💬';
  
  const commentCount = document.createElement('span');
  commentCount.textContent = post.postComments;
  interactionCommentsWrapper.appendChild(commentCount);




  return article;
}


function createComment(comment) {
  const commentContainer = document.createElement('article');
  commentContainer.classList.add('comment-container');

  const commentEl = document.createElement('section');
  commentEl.classList.add('comment');
  commentContainer.appendChild(commentEl);

  const commentAuthorImage = document.createElement('img');
  commentAuthorImage.classList.add('comment-author-image');
  commentAuthorImage.src = comment.authorImage;
  commentEl.appendChild(commentAuthorImage);

  const commentData = document.createElement('div');
  commentData.classList.add('comment-data');
  commentEl.appendChild(commentData);

  const commentAuthorName = document.createElement('h2');
  commentAuthorName.classList.add('comment-author-name');
  commentAuthorName.textContent = comment.authorName;
  commentData.appendChild(commentAuthorName);

  const commentContent = document.createElement('div');
  commentContent.classList.add('comment-content');
  commentData.appendChild(commentContent);

  const commentText = document.createElement('p');
  commentText.textContent = comment.commentText;
  commentContent.appendChild(commentText);

  const commentBottomWrapper = document.createElement('div');
  commentBottomWrapper.classList.add('comment-bottom-wrapper');
  commentData.appendChild(commentBottomWrapper);

  const commentDate = document.createElement('div');
  commentDate.classList.add('comment-date');
  commentDate.textContent = comment.createdAt;
  commentBottomWrapper.appendChild(commentDate);

  const replyBtn = document.createElement('button');
  replyBtn.classList.add('reply-btn');
  replyBtn.textContent = 'Reply';
  commentBottomWrapper.appendChild(replyBtn);

  const commentHeartsWrapper = document.createElement('div');
  commentHeartsWrapper.classList.add('comment-hearts-wrapper');
  commentEl.appendChild(commentHeartsWrapper);

  const heartCommentBtn = document.createElement('button');
  heartCommentBtn.classList.add('heart-comment-btn');
  heartCommentBtn.textContent = '🖤';
  commentHeartsWrapper.appendChild(heartCommentBtn);

  const heartCommentCount = document.createElement('div');
  heartCommentCount.classList.add('reactions-number');
  heartCommentCount.textContent = comment.commentHearts;
  commentHeartsWrapper.appendChild(heartCommentCount);

  if (comment.commentReplies > 0) {
    const seeMoreRepliesBtn = document.createElement('button');
    seeMoreRepliesBtn.classList.add('see-more-btn');
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "btn-icon");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute(
      "d",
      "M10 8L14 8V10L8 16L2 10V8H6V0L10 4.76995e-08V8Z"
    );
    path.setAttribute("fill", "currentColor");

    svg.appendChild(path);

    const span = document.createElement("span");
    span.textContent = `See replies (${comment.commentReplies})`;
    seeMoreRepliesBtn.appendChild(svg);
    seeMoreRepliesBtn.appendChild(span);
    commentContainer.appendChild(seeMoreRepliesBtn);
  }

  return commentContainer;
}


document.querySelector('.posts').addEventListener('click', (e) => {
  if (!e.target.matches(".like-btn")) return;
  const postEl = e.target.closest(".post");
  const postId = postEl.dataset.postId;
  likePost(postId, postEl);
})

function likePost(postId, postEl) {
  const likesEl = postEl.querySelector('.like-count');
  const likeBtn = postEl.querySelector('.like-btn');
  if (likeBtn.dataset.liked == "true") {
    likeBtn.dataset.liked = false;
    likesEl.dataset.liked = false;
    likesEl.textContent = Number(likesEl.textContent) - 1;
    return
  }
  likeBtn.dataset.liked = true;
  likesEl.dataset.liked = true;
  likesEl.textContent = Number(likesEl.textContent) + 1;
}