import { formatDate } from "../utils/formatDate.js";

export function renderNewPosts(posts) {
  const container = document.querySelector('.posts');
  const fragment = document.createDocumentFragment();
  posts.forEach(post => {
    fragment.appendChild(createPost(post));
  })

  container.appendChild(fragment);
}



export function createPost(post) {
  const article = document.createElement('article');
  article.classList.add('post-container');
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

  const link = document.createElement('a');
  link.href = `/meet-me/profile/${post.authorName}`;
  authorContainer.appendChild(link);

  const authorImage = document.createElement('img');
  authorImage.src = post.authorImage;
  authorImage.alt = "image";
  authorImage.classList.add('author-image');
  link.appendChild(authorImage);
  //authorContainer.appendChild(authorImage);

  const postInformation = document.createElement('div');
  postInformation.classList.add('post-information');
  authorContainer.appendChild(postInformation);

  const link2 = document.createElement('a');
  link2.classList.add('author-name-link');
  link2.href = `/meet-me/profile/${post.authorName}`;
  postInformation.appendChild(link2);


  const authorName = document.createElement('h2');
  authorName.classList.add('author-name');
  authorName.textContent = post.authorName;
  link2.appendChild(authorName);
  //postInformation.appendChild(authorName);

  const postDate = document.createElement('div');
  postDate.classList.add('post-date');
  if (post.edited) {
    postDate.textContent = formatDate(post.lastModifiedAt) + ' (edited)';
  }
  else {
    postDate.textContent = formatDate(post.createdAt);
  }

  postInformation.appendChild(postDate);

  if (post.isCreatedByUser) {
    const actionPostBtn = document.createElement('button');
    actionPostBtn.classList.add('action-btn');
    actionPostBtn.classList.add('action-post-btn');
    postHeader.appendChild(actionPostBtn);
    actionPostBtn.textContent = '⫶';
  }

  /*if (!post.observed) {
    const addBtn = document.createElement('button');
    addBtn.classList.add('add-btn');
    postHeader.appendChild(addBtn);
    addBtn.textContent = '➕';
  }*/



  const postContentWrapper = document.createElement('div');
  postContentWrapper.classList.add('post-content-wrpapper');
  section.appendChild(postContentWrapper);

  const postContent = document.createElement('div');
  postContent.classList.add('post-content');
  postContentWrapper.appendChild(postContent);

  const postContentText = document.createElement('p');
  postContentText.textContent = post.postText;
  postContent.appendChild(postContentText);

  const editingContainer = document.createElement('div');
  editingContainer.classList.add('editing-container');

  postContent.appendChild(editingContainer);

  const discardBtn = document.createElement('button');
  discardBtn.classList.add('editing-btn');
  discardBtn.classList.add('discard-btn');
  discardBtn.textContent = 'Discard';
  editingContainer.appendChild(discardBtn);

  const editBtn = document.createElement('button');
  editBtn.classList.add('editing-btn');
  editBtn.classList.add('save-edit-btn');
  editBtn.textContent = 'Edit';
  editingContainer.appendChild(editBtn);

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
  heartCount.classList.add('heart-count');
  heartCount.textContent = post.postHearts;
  interactionHeartWrapper.appendChild(heartCount);

  if (post.liked == 1) {
    heartBtn.classList.add('liked');
    heartCount.classList.add('liked');
  }


  const interactionLikesWrapper = document.createElement('div');
  interactionLikesWrapper.classList.add('interaction-wrapper');
  interactionLikesWrapper.classList.add('reactions-wrapper');
  reactions.appendChild(interactionLikesWrapper);

  const likeBtn = document.createElement('button');
  likeBtn.classList.add('interactions-btn');
  likeBtn.classList.add('reaction-btn');
  likeBtn.classList.add('like-btn');
  likeBtn.classList.add('yellow-reaction-btn');
  interactionLikesWrapper.appendChild(likeBtn);
  likeBtn.textContent = '👍';


  const likeCount = document.createElement('span');
  likeCount.classList.add('like-count');
  likeCount.classList.add('yellow-reaction-count');
  likeCount.textContent = post.postLikes;
  interactionLikesWrapper.appendChild(likeCount);

  if (post.liked == 2) {
    likeBtn.classList.add('liked');
    likeCount.classList.add('liked');
  }

  const interactionDislikesWrapper = document.createElement('div');
  interactionDislikesWrapper.classList.add('interaction-wrapper');
  interactionDislikesWrapper.classList.add('reactions-wrapper');
  reactions.appendChild(interactionDislikesWrapper);

  const dislikeBtn = document.createElement('button');
  dislikeBtn.classList.add('interactions-btn');
  dislikeBtn.classList.add('reaction-btn');
  dislikeBtn.classList.add('dislike-btn');
  dislikeBtn.classList.add('yellow-reaction-btn');
  interactionDislikesWrapper.appendChild(dislikeBtn);
  dislikeBtn.textContent = '👎';

  const dislikeCount = document.createElement('span');
  dislikeCount.textContent = post.postDislikes;
  dislikeCount.classList.add('dislike-count');
  dislikeCount.classList.add('yellow-reaction-count');
  interactionDislikesWrapper.appendChild(dislikeCount);

  if (post.liked == 3) {
    dislikeBtn.classList.add('liked');
    dislikeCount.classList.add('liked');
  }


  const rightButtons = document.createElement('div');
  rightButtons.classList.add('right-buttons');
  postInteractions.appendChild(rightButtons);
  /*
  const saveBtn = document.createElement('button');
  saveBtn.classList.add('interactions-btn');
  saveBtn.classList.add('save-btn');
  if (post.saved == true) {
    saveBtn.classList.add('saved');
  }
  rightButtons.appendChild(saveBtn);
  saveBtn.textContent = '📌';*/

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

  const comments = document.createElement('section');
  comments.classList.add('comments');
  article.appendChild(comments);




  return article;
}
