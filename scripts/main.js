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