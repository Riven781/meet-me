import { formatDate } from "../utils/formatDate.js";

export function renderNewComments(comments, postEl, firstLoad, isEnd) {
  const container = postEl.querySelector('.comments');
  container.classList.add('active');

  if (firstLoad) {
    renderCommentTextArea(container);
  }
  else {
    postEl.querySelector('.more-comments-btn').remove();  //usunięcie seeMore
  }

  const fragment = document.createDocumentFragment();

  comments.forEach(comment => {
    const commentElement = createComment(comment);
    fragment.appendChild(commentElement);
  });

  container.appendChild(fragment);

  if (!isEnd) {
    renderSeeMoreButton(container);
  }

}



export function createComment(comment) {
  const commentContainer = document.createElement('article');
  commentContainer.dataset.commentId = comment.id;
  commentContainer.classList.add('comment-container');

  const commentEl = document.createElement('section');
  commentEl.classList.add('comment');
  commentContainer.appendChild(commentEl);

  const link = document.createElement('a');
  link.href = `/meet-me/profile/${comment.authorName}`;
  commentEl.appendChild(link);

  const commentAuthorImage = document.createElement('img');
  commentAuthorImage.classList.add('comment-author-image');
  commentAuthorImage.src = comment.authorImage;
  link.appendChild(commentAuthorImage);
  //commentEl.appendChild(commentAuthorImage);

  const commentData = document.createElement('div');
  commentData.classList.add('comment-data');
  commentEl.appendChild(commentData);

  const link2 = document.createElement('a');
  link2.href = `/meet-me/profile/${comment.authorName}`;
  link2.classList.add('author-name-link');
  commentData.appendChild(link2);

  const commentAuthorName = document.createElement('h2');
  commentAuthorName.classList.add('comment-author-name');
  commentAuthorName.textContent = comment.authorName;
  link2.appendChild(commentAuthorName);
  //commentData.appendChild(commentAuthorName);

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
  commentDate.textContent = formatDate(comment.createdAt); // comment.createdAt;
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

  const heartCommentCount = document.createElement('div');
  heartCommentCount.classList.add('reactions-number');
  heartCommentCount.textContent = comment.commentHearts;

  if (comment.isLiked == true) {
    heartCommentBtn.textContent = '❤️';
    heartCommentCount.classList.add('liked');
  }
  else {
    heartCommentBtn.textContent = '🖤';
  }

  commentHeartsWrapper.appendChild(heartCommentBtn);


  commentHeartsWrapper.appendChild(heartCommentCount);

  const repliesContainer = document.createElement('section');
  repliesContainer.classList.add('comments-replies');
  repliesContainer.classList.add('comments');
  commentContainer.appendChild(repliesContainer);

  console.log(`replies: ${comment.commentReplies}`);

  if (comment.commentReplies > 0) {
    const seeMoreRepliesBtn = document.createElement('button');
    seeMoreRepliesBtn.classList.add('see-more-btn');
    seeMoreRepliesBtn.classList.add('more-replies-btn');
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
    span.textContent = `See replies`;
    seeMoreRepliesBtn.appendChild(svg);
    seeMoreRepliesBtn.appendChild(span);
    commentContainer.appendChild(seeMoreRepliesBtn);

  }

  return commentContainer;
}


function renderCommentTextArea(container) {
  const form = document.createElement('form');

  const labelArea = document.createElement('div');
  labelArea.classList.add('label-area');
  labelArea.style.display = 'none';
  form.appendChild(labelArea);

  const exitBtn = document.createElement('button');
  exitBtn.classList.add('exit-btn');
  exitBtn.type = 'button';
  exitBtn.textContent = 'X';
  labelArea.appendChild(exitBtn);

  const label = document.createElement('label');
  label.classList.add('reply-label');
  label.textContent = 'Add a comment:';
  labelArea.appendChild(label);

  form.classList.add('post-form');
  form.classList.add('comment-form');
  container.appendChild(form);

  const textarea = document.createElement('textarea');
  textarea.id = 'comment-text';
  textarea.rows = 2;
  textarea.placeholder = 'Write comment...';
  form.appendChild(textarea);

  const postBtn = document.createElement('button');
  postBtn.type = 'button';
  postBtn.id = 'create-comment-btn';
  postBtn.textContent = 'Post this comment';
  form.appendChild(postBtn);
}


function renderSeeMoreButton(container) {

  const seeMoreRepliesBtn = document.createElement('button');
  seeMoreRepliesBtn.classList.add('see-more-btn');
  seeMoreRepliesBtn.classList.add('more-comments-btn');
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
  span.textContent = `See more comments`;
  seeMoreRepliesBtn.appendChild(svg);
  seeMoreRepliesBtn.appendChild(span);
  container.appendChild(seeMoreRepliesBtn);
}


export function setHeartUI(btnEl, counterEl, liked, count) {
  btnEl.textContent = liked ? "❤️" : "🖤";
  counterEl.classList.toggle("liked", liked);
  counterEl.textContent = String(count);
}