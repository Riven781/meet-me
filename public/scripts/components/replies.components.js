import { formatDate } from "../utils/formatDate.js";

export function renderNewReplies(replies, commentEl, isEnd) {

  const container = commentEl.querySelector('.comments-replies');
  container.classList.add('active');
  

  const fragment = document.createDocumentFragment();

  replies.forEach(reply => {
    const replyElement = createReply(reply);
    fragment.appendChild(replyElement);
  });

  container.appendChild(fragment);

  const seeMoreBtn = commentEl.querySelector('.more-replies-btn');

  container.appendChild(seeMoreBtn);  //seeReplies wędruje na koniec

  if (isEnd) {
    seeMoreBtn.remove();
  }
}


export function createReply(reply) {
  const commentReply = document.createElement('article');
  commentReply.classList.add('comment-reply');
  commentReply.classList.add('comment');
  commentReply.dataset.commentId = reply.id;

  const link = document.createElement('a');
  link.href = `/meet-me/profile/${reply.authorName}`;
  commentReply.appendChild(link);

  const commentAuthorImage = document.createElement('img');
  commentAuthorImage.classList.add('comment-author-image');
  commentAuthorImage.src = reply.authorImage;
  link.appendChild(commentAuthorImage);
  //commentReply.appendChild(commentAuthorImage);


  const commentData = document.createElement('div');
  commentData.classList.add('comment-data');
  commentReply.appendChild(commentData);

  const link2 = document.createElement('a');
  link2.href = `/meet-me/profile/${reply.authorName}`;
  link2.classList.add('author-name-link');
  commentData.appendChild(link2);

  const commentAuthorName = document.createElement('h2');
  commentAuthorName.classList.add('comment-author-name');
  commentAuthorName.textContent = reply.authorName;
  link2.appendChild(commentAuthorName);
  //commentData.appendChild(commentAuthorName);

  const commentContent = document.createElement('div');
  commentContent.classList.add('comment-content');
  commentData.appendChild(commentContent);

  const commentText = document.createElement('p');
  commentText.textContent = reply.commentText;
  commentContent.appendChild(commentText);

  const commentBottomWrapper = document.createElement('div');
  commentBottomWrapper.classList.add('comment-bottom-wrapper');
  commentData.appendChild(commentBottomWrapper);

  const commentDate = document.createElement('div');
  commentDate.classList.add('comment-date');
  commentDate.textContent = formatDate(reply.createdAt); //  reply.createdAt;
  commentBottomWrapper.appendChild(commentDate);

  const replyBtn = document.createElement('button');
  replyBtn.classList.add('reply-btn');
  replyBtn.textContent = 'Reply';
  commentBottomWrapper.appendChild(replyBtn);

  const commentHeartsWrapper = document.createElement('div');
  commentHeartsWrapper.classList.add('comment-hearts-wrapper');
  commentReply.appendChild(commentHeartsWrapper);

  const heartCommentBtn = document.createElement('button');
  heartCommentBtn.classList.add('heart-comment-btn');

  const heartCommentCount = document.createElement('div');
  heartCommentCount.classList.add('reactions-number');
  heartCommentCount.textContent = reply.commentHearts;

  if (reply.isLiked == true) {
    heartCommentBtn.textContent = '❤️';
    heartCommentCount.classList.add('liked');
  }
  else {
    heartCommentBtn.textContent = '🖤';
  }
  commentHeartsWrapper.appendChild(heartCommentBtn);


  commentHeartsWrapper.appendChild(heartCommentCount);

  return commentReply;
}
