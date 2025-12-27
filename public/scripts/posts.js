const textarea = document.getElementById("post-text");
const postBtn = document.getElementById("post-btn");
const commentBtn = document.getElementsByClassName("comment-btn");

const maxHeight = 300;

postBtn.parentElement.classList.toggle('show', textarea.value.trim() !== '');

async function publishPost(text) {
  const response = await fetch('/api/createPost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })

  const data = await response.json();
  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

postBtn.addEventListener('click', async (e) => {
  console.log('click');
  e.preventDefault();
  const text = textarea.value;
  console.log(text);
  const result = await publishPost(text);

  if (result.ok) {
    textarea.value = '';
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    postBtn.parentElement.classList.toggle('show', textarea.value.trim() !== '');
    //loadPosts(); //TODO załaduj ten post po stworzeniu albo jeszcze lepiej zwróć go z createPost

    const container = document.querySelector('.posts');
    console.log(result);
    console.log(result.data);
    console.log(result.data.postData);


    appModel.posts.push(result.data.postData);
    appModel.postsById[result.data.postData.id] = result.data.postData;


    container.insertBefore(createPost(result.data.postData), container.firstChild);

    console.log('tu');
  }

});

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

const appModel = {
  posts: [],
  postsById: {},
  commentsByPostId: {},
  repliesByCommentId: {},
  commentsById: {}
}

let posts = [];

let nextPostCursor = null;
let loading = false;
let end = false;

function isEndNearViewport() {
  const rect = postEnd.getBoundingClientRect();
  return rect.top <= window.innerHeight + 200;
}

async function loadPosts(lastId = null) {
  if (loading || end) return;
  loading = true;
  try {
    const url = `/api/getPosts?limit=5${nextPostCursor ? `&lastPostCursor=${encodeURIComponent(nextPostCursor)}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
      },
    }
    );

    console.log(res);

    const data = await res.json();
    console.log(data);
    nextPostCursor = data.nextPostCursor;

    console.log(` loaded nextPostCursor: ${nextPostCursor}`);
    if (nextPostCursor) {
      console.log(` decoded: ${encodeURIComponent(nextPostCursor)}`);
    }

    if (!nextPostCursor) {
      end = true;
    }

    const newPosts = data.posts || [];

    //const newPosts = await res.json();
    appModel.posts.push(...newPosts);
    newPosts.forEach(post => {
      appModel.postsById[post.id] = post;
      appModel.postsById[post.id].confirmedReaction = post.liked ?? 0;

    })


    //TODO: sprawdzaj czy nie załadowano tego samego posta 
    renderNewPosts(newPosts);

    requestAnimationFrame(() => {
      if (!end && isEndNearViewport()) {
        console.log('loading more hoho');
        loadPosts();
      }
    });

  } catch (error) {
    console.error(error);
  } finally {
    loading = false;
  }


}

function renderNewPosts(posts) {
  const container = document.querySelector('.posts');
  const fragment = document.createDocumentFragment();
  posts.forEach(post => {
    fragment.appendChild(createPost(post));
  })

  container.appendChild(fragment);
}


loadPosts();
window.scrollTo(0, 0);


const postEnd = document.getElementById('feed-end');

const observer = new IntersectionObserver((entries) => {
  const entry = entries[0];
  console.log('observing');
  console.log(entry.isIntersecting);

  if (entry.isIntersecting) loadPosts();
}, {
  root: null, //sprawdza czy element jest widoczny w oknie przeglądarki
  rootMargin: "200px",   //200px przed końcem strony pozwala na ładowanie nowych postów
  threshold: 0.01
});

observer.observe(postEnd);

async function loadComments(postId, postEl, firstLoad) {
  let commentsByPostId = appModel.commentsByPostId[postId];

  if (!commentsByPostId) {
    commentsByPostId = {
      items: [],
      isLoading: false,
      error: null,
    };
  }

  if (commentsByPostId.isLoading) return;

  commentsByPostId.isLoading = true;

  const res = await fetch('./../data/comments.json');
  const comments = await res.json();

  comments.forEach(comment => {
    appModel.commentsById[comment.id] = comment;
  })

  commentsByPostId.items.push(...comments);

  commentsByPostId.isLoading = false;

  appModel.commentsByPostId[postId] = commentsByPostId;


  renderNewComments(comments, postEl, firstLoad);



}

async function loadReplies(commentId, commentEl) {
  let repliesByCommentId = appModel.repliesByCommentId[commentId];

  if (!repliesByCommentId) {
    repliesByCommentId = {
      items: [],
      isLoading: false,
      error: null,
    };
  }

  if (repliesByCommentId.isLoading) return;

  const res = await fetch('./../data/replies.json');
  const replies = await res.json();

  replies.forEach(reply => {
    appModel.commentsById[reply.id] = reply;
  })

  repliesByCommentId.items.push(...replies);

  repliesByCommentId.isLoading = false;

  appModel.repliesByCommentId[commentId] = repliesByCommentId;

  renderNewReplies(replies, commentEl);
}

function renderNewReplies(replies, commentEl) {
  console.log("tuu")
  //w przyszłości będziemy tu przekazywali liste repplies orza zmienną isMore




  const container = commentEl.querySelector('.comments-replies');
  container.classList.add('active');
  console.log(container);

  //commentEl.querySelector('.more-replies-btn').remove();  //usunięcie seeReplies

  const fragment = document.createDocumentFragment();

  replies.forEach(reply => {
    const replyElement = createReply(reply);
    fragment.appendChild(replyElement);
  });

  container.appendChild(fragment);

  container.appendChild(commentEl.querySelector('.more-replies-btn'));  //seeReplies wędruje na koniec
}


function renderNewComments(comments, postEl, firstLoad) {


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

  renderSeeMoreButton(container);

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


function renderCommentTextArea(container) {
  const form = document.createElement('form');
  form.classList.add('post-form');
  form.classList.add('comment-form');
  container.appendChild(form);

  const textarea = document.createElement('textarea');
  textarea.id = 'comment-text';
  textarea.rows = 2;
  textarea.placeholder = 'Write comment...';
  form.appendChild(textarea);

  const postBtn = document.createElement('button');
  postBtn.type = 'submit';
  postBtn.id = 'create-comment-btn';
  postBtn.textContent = 'Post this comment';
  form.appendChild(postBtn);
}



function clearComments(postEl) {
  const container = postEl.querySelector('.comments');
  container.classList.remove('active');
  container.innerHTML = '';
}



function createPost(post) {
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

  const authorImage = document.createElement('img');
  authorImage.src = post.authorImage;
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

  if (!post.observed) {
    const addBtn = document.createElement('button');
    addBtn.classList.add('add-btn');
    postHeader.appendChild(addBtn);
    addBtn.textContent = '➕';
  }



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

  const saveBtn = document.createElement('button');
  saveBtn.classList.add('interactions-btn');
  saveBtn.classList.add('save-btn');
  if (post.saved == true) {
    saveBtn.classList.add('saved');
  }
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

  const comments = document.createElement('section');
  comments.classList.add('comments');
  article.appendChild(comments);




  return article;
}


function createComment(comment) {
  const commentContainer = document.createElement('article');
  commentContainer.dataset.commentId = comment.id;
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
    span.textContent = `See replies (${comment.commentReplies})`;
    seeMoreRepliesBtn.appendChild(svg);
    seeMoreRepliesBtn.appendChild(span);
    commentContainer.appendChild(seeMoreRepliesBtn);

    const repliesContainer = document.createElement('section');
    repliesContainer.classList.add('comments-replies');
    repliesContainer.classList.add('comments');
    commentContainer.appendChild(repliesContainer);
  }

  return commentContainer;
}

function createReply(reply) {
  const commentReply = document.createElement('article');
  commentReply.classList.add('comment-reply');
  commentReply.classList.add('comment');
  commentReply.dataset.commentId = reply.id;

  const commentAuthorImage = document.createElement('img');
  commentAuthorImage.classList.add('comment-author-image');
  commentAuthorImage.src = reply.authorImage;
  commentReply.appendChild(commentAuthorImage);

  const commentData = document.createElement('div');
  commentData.classList.add('comment-data');
  commentReply.appendChild(commentData);

  const commentAuthorName = document.createElement('h2');
  commentAuthorName.classList.add('comment-author-name');
  commentAuthorName.textContent = reply.authorName;
  commentData.appendChild(commentAuthorName);

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
  commentDate.textContent = reply.createdAt;
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



document.querySelector('.posts').addEventListener('click', (e) => {
  if (e.target.matches(".comment-btn")) {
    const postEl = e.target.closest(".post-container");
    const currentPostId = postEl.dataset.postId;

    for (const postId in appModel.commentsByPostId) {
      if (postId == currentPostId) continue;
      delete appModel.commentsByPostId[postId];
      const commentsToClose = document.querySelector(`.post-container[data-post-id="${postId}"]`);
      if (commentsToClose) clearComments(commentsToClose);
    }

    if (appModel.commentsByPostId[currentPostId]) {
      console.log('already loaded');
      delete appModel.commentsByPostId[currentPostId];
      clearComments(postEl);
    }
    else {
      loadComments(currentPostId, postEl, true);
    }
  }

  if (e.target.closest(".more-replies-btn")) { //czasami zdarzenie matchowało span lub svg a nie button
    console.log('more replies');
    const commentEl = e.target.closest(".comment-container");
    const commentId = commentEl.dataset.commentId;
    console.log(commentEl);
    loadReplies(commentId, commentEl);
  }

  if (e.target.closest(".more-comments-btn")) {

    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    loadComments(postId, postEl, false);
  }

  if (e.target.matches(".like-btn")) {
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    likePostServerCall(postId, postEl);
    //likePost(postId, postEl);
  }


  if (e.target.matches(".heart-btn")) {
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;

    //heartPost(postId, postEl);
    heartPostServerCall(postId, postEl);
  }

  if (e.target.matches(".dislike-btn")) {
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;

    //dislikePost(postId, postEl);
    dislikePostServerCall(postId, postEl);
  }

  if (e.target.matches(".add-btn")) {
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    const followedAuthorId = appModel.postsById[postId].authorId
    const postsByFollowedAuthor = appModel.posts.filter(post => post.authorId == followedAuthorId)

    postsByFollowedAuthor.forEach(post => {
      if (post.observed) return;
      const postEl = document.querySelector(`.post-container[data-post-id="${post.id}"]`);
      const addBtn = postEl.querySelector('.add-btn');

      addBtn.classList.add('hidden');
      appModel.postsById[post.id].observed = true;
    })

    const info = document.createElement('div');

    const undoBtn = document.createElement('button');
    undoBtn.classList.add('undo-btn');
    undoBtn.textContent = 'Undo';


    setTimeout(() => {
      e.target.style.display = 'none';
      info.classList.add('info');
      const text = document.createElement('span');
      text.textContent = 'Followed';
      info.appendChild(text);
      info.appendChild(undoBtn);

      //info.textContent = `You've followed ${appModel.postsById[postId].authorName}'s posts!`;

      e.target.parentElement.appendChild(info);
    }, 300)
  }

  if (e.target.matches(".undo-btn")) {
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    const authorId = appModel.postsById[postId].authorId;

    const info = postEl.querySelector('.info');
    info.remove();

    const postsByAuthor = appModel.posts.filter(post => post.authorId == authorId)
    postsByAuthor.forEach(post => {
      const postEl = document.querySelector(`.post-container[data-post-id="${post.id}"]`);
      const addBtn = postEl.querySelector('.add-btn');
      addBtn.style.display = 'flex';
      addBtn.classList.remove('hidden');
      appModel.postsById[post.id].observed = false;
    })
  }

  if (e.target.matches(".save-btn")) {

    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;

    const post = appModel.postsById[postId];

    if (post.saved) {
      e.target.classList.remove('saved');
      post.saved = false;
    }
    else {
      e.target.classList.add('saved');
      post.saved = true;
    }


    //savePost(postId);
  }

  if (e.target.matches(".heart-comment-btn")) {
    const commentEl = e.target.closest(".comment-container");
    const replyEl = e.target.closest(".comment-reply");

    const commentId = replyEl ? replyEl.dataset.commentId : commentEl.dataset.commentId;

    const comment = appModel.commentsById[commentId];
    const counterEl = e.target.nextSibling;


    if (comment.isLiked) {

      e.target.textContent = '🖤';
      counterEl.classList.remove('liked');
      comment.isLiked = false;
      comment.commentHearts--;
      counterEl.textContent = comment.commentHearts;

    }
    else {
      e.target.textContent = '❤️';
      counterEl.classList.add('liked');

      comment.isLiked = true;
      comment.commentHearts++;
      counterEl.textContent = comment.commentHearts;
    }

    //heartComment(commentId, commentEl);
  }

})

function setClassesForReactionButtons(elementsToAddClass, elementsToRemoveClass) {
  if (elementsToAddClass) {
    if (elementsToAddClass.btn) elementsToAddClass.btn.classList.add('liked');
    if (elementsToAddClass.counter) elementsToAddClass.counter.classList.add('liked');
    elementsToAddClass.counter.textContent = elementsToAddClass.newCounter;
  }

  if (elementsToRemoveClass) {
    if (elementsToRemoveClass.btn) elementsToRemoveClass.btn.classList.remove('liked');
    if (elementsToRemoveClass.counter) elementsToRemoveClass.counter.classList.remove('liked');
    elementsToRemoveClass.counter.textContent = elementsToRemoveClass.newCounter;
  }

}

async function likePostServerCall(postId, postEl) {
  const previousReaction = appModel.postsById[postId].liked;
  const reactionType = appModel.postsById[postId].liked == 2 ? 0 : 2; //to chcemy ustawić 
  likePost(postId, postEl);
  const optimisticReaction = appModel.postsById[postId].liked;
  let response;

  try {
    response = await fetch('/api/reaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ postId, reactionType })
    })
  } catch (error) {
    if (appModel.postsById[postId].confirmedReaction !== appModel.postsById[postId].liked) {
      synchronizeReactions(appModel.postsById[postId].liked, appModel.postsById[postId].confirmedReaction, postId, postEl);
    }

    return

  }


  let data;
  try {
    data = await response.json();
  } catch (error) { data = {}; }

  if (typeof data.reaction === "number") {
    appModel.postsById[postId].confirmedReaction = data.reaction;
  }


  const serverReaction =
    typeof data.reaction === "number"
      ? data.reaction
      : previousReaction;


  if (serverReaction !== optimisticReaction) {
    synchronizeReactions(optimisticReaction, serverReaction, postId, postEl);
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  }
}




async function heartPostServerCall(postId, postEl) {
  const previousReaction = appModel.postsById[postId].liked;
  const reactionType = appModel.postsById[postId].liked == 1 ? 0 : 1;
  heartPost(postId, postEl);
  const optimisticReaction = appModel.postsById[postId].liked;
  let response;

  try {
    response = await fetch('/api/reaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ postId, reactionType })
    })
  } catch (error) {
    if (appModel.postsById[postId].confirmedReaction !== appModel.postsById[postId].liked) {
      synchronizeReactions(appModel.postsById[postId].liked, appModel.postsById[postId].confirmedReaction, postId, postEl);
    }
    return

  }

  let data;
  try {
    data = await response.json();
  } catch (error) { data = {}; }

  if (typeof data.reaction === "number") {
    appModel.postsById[postId].confirmedReaction = data.reaction;
  }


  const serverReaction =
    typeof data.reaction === "number"
      ? data.reaction
      : previousReaction;


  if (serverReaction !== optimisticReaction) {
    synchronizeReactions(optimisticReaction, serverReaction, postId, postEl);
  }
  return {
    ok: response.ok,
    status: response.status,
    data
  }

}

async function dislikePostServerCall(postId, postEl) {
  const previousReaction = appModel.postsById[postId].liked;
  const reactionType = appModel.postsById[postId].liked == 3 ? 0 : 3;
  dislikePost(postId, postEl);
  const optimisticReaction = appModel.postsById[postId].liked;

  let response;

  try {
    response = await fetch('/api/reaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ postId, reactionType })
    })
  } catch (error) {
    if (appModel.postsById[postId].confirmedReaction !== appModel.postsById[postId].liked) {
      synchronizeReactions(appModel.postsById[postId].liked, appModel.postsById[postId].confirmedReaction, postId, postEl);
    }
    return

  }


  let data;
  try {
    data = await response.json();
  } catch (error) { data = {}; }
  if (typeof data.reaction === "number") {
    appModel.postsById[postId].confirmedReaction = data.reaction;
  }


  const serverReaction =
    typeof data.reaction === "number"
      ? data.reaction
      : previousReaction;


  if (serverReaction !== optimisticReaction) {
    synchronizeReactions(optimisticReaction, serverReaction, postId, postEl);
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  }
}

function setLike(postId, postEl) {
  const likesCount = postEl.querySelector('.like-count');
  const likeBtn = postEl.querySelector('.like-btn');
  appModel.postsById[postId].liked = 2;
  appModel.postsById[postId].postLikes = Number(appModel.postsById[postId].postLikes) + 1;
  setClassesForReactionButtons({ btn: likeBtn, counter: likesCount, newCounter: appModel.postsById[postId].postLikes });
}

function setHeart(postId, postEl) {
  const heartsCount = postEl.querySelector('.heart-count');
  const heartBtn = postEl.querySelector('.heart-btn');
  appModel.postsById[postId].liked = 1;
  appModel.postsById[postId].postHearts = Number(appModel.postsById[postId].postHearts) + 1;
  setClassesForReactionButtons({ btn: heartBtn, counter: heartsCount, newCounter: appModel.postsById[postId].postHearts });
}

function setDislike(postId, postEl) {
  const dislikesCount = postEl.querySelector('.dislike-count');
  const dislikeBtn = postEl.querySelector('.dislike-btn');
  appModel.postsById[postId].liked = 3;
  appModel.postsById[postId].postDislikes = Number(appModel.postsById[postId].postDislikes) + 1;
  setClassesForReactionButtons({ btn: dislikeBtn, counter: dislikesCount, newCounter: appModel.postsById[postId].postDislikes });
}

function removeLike(postId, postEl) {
  const likesCount = postEl.querySelector('.like-count');
  const likeBtn = postEl.querySelector('.like-btn');
  appModel.postsById[postId].liked = 0;
  appModel.postsById[postId].postLikes = Number(appModel.postsById[postId].postLikes) - 1;
  setClassesForReactionButtons(null, { btn: likeBtn, counter: likesCount, newCounter: appModel.postsById[postId].postLikes });
}

function removeHeart(postId, postEl) {
  const heartsCount = postEl.querySelector('.heart-count');
  const heartBtn = postEl.querySelector('.heart-btn');
  appModel.postsById[postId].liked = 0;
  appModel.postsById[postId].postHearts = Number(appModel.postsById[postId].postHearts) - 1;
  setClassesForReactionButtons(null, { btn: heartBtn, counter: heartsCount, newCounter: appModel.postsById[postId].postHearts });
}

function removeDislike(postId, postEl) {
  const dislikesCount = postEl.querySelector('.dislike-count');
  const dislikeBtn = postEl.querySelector('.dislike-btn');
  appModel.postsById[postId].liked = 0;
  appModel.postsById[postId].postDislikes = Number(appModel.postsById[postId].postDislikes) - 1;
  setClassesForReactionButtons(null, { btn: dislikeBtn, counter: dislikesCount, newCounter: appModel.postsById[postId].postDislikes });
}

function synchronizeReactions(prev, newReaction, postId, postEl) {
  if (prev === 0) {
    if (newReaction === 1) {
      setHeart(postId, postEl);
    }
    else if (newReaction === 2) {
      setLike(postId, postEl);
    }
    else if (newReaction === 3) {
      setDislike(postId, postEl);
    }
  }
  else if (prev === 1) {
    removeHeart(postId, postEl);
    if (newReaction === 2) {
      setLike(postId, postEl);
    }
    else if (newReaction === 3) {
      setDislike(postId, postEl);
    }
  }
  else if (prev === 2) {
    removeLike(postId, postEl);
    if (newReaction === 1) {
      setHeart(postId, postEl);
    }
    else if (newReaction === 3) {
      setDislike(postId, postEl);
    }
  }
  else if (prev === 3) {
    removeDislike(postId, postEl);
    if (newReaction === 1) {
      setHeart(postId, postEl);
    }
    else if (newReaction === 2) {
      setLike(postId, postEl);
    }
  }
}

function likePost(postId, postEl) {
  const likesCount = postEl.querySelector('.like-count');
  const likeBtn = postEl.querySelector('.like-btn');


  const likedStatus = appModel.postsById[postId].liked;

  if (likedStatus == 0) {
    appModel.postsById[postId].liked = 2;
    appModel.postsById[postId].postLikes = Number(appModel.postsById[postId].postLikes) + 1;
    setClassesForReactionButtons({ btn: likeBtn, counter: likesCount, newCounter: appModel.postsById[postId].postLikes });
  }
  else if (likedStatus == 2) {
    appModel.postsById[postId].liked = 0;
    appModel.postsById[postId].postLikes = Number(appModel.postsById[postId].postLikes) - 1;
    setClassesForReactionButtons(null, { btn: likeBtn, counter: likesCount, newCounter: appModel.postsById[postId].postLikes });
  }
  else if (likedStatus == 1) {
    const heartsCount = postEl.querySelector('.heart-count');
    const heartBtn = postEl.querySelector('.heart-btn');
    appModel.postsById[postId].liked = 2;
    appModel.postsById[postId].postLikes = Number(appModel.postsById[postId].postLikes) + 1;
    appModel.postsById[postId].postHearts = Number(appModel.postsById[postId].postHearts) - 1;

    setClassesForReactionButtons(
      { btn: likeBtn, counter: likesCount, newCounter: appModel.postsById[postId].postLikes },
      { btn: heartBtn, counter: heartsCount, newCounter: appModel.postsById[postId].postHearts }
    );
  }
  else if (likedStatus == 3) {
    const dislikesCount = postEl.querySelector('.dislike-count');
    const dislikeBtn = postEl.querySelector('.dislike-btn');
    appModel.postsById[postId].liked = 2;
    appModel.postsById[postId].postLikes = Number(appModel.postsById[postId].postLikes) + 1;
    appModel.postsById[postId].postDislikes = Number(appModel.postsById[postId].postDislikes) - 1;

    setClassesForReactionButtons(
      { btn: likeBtn, counter: likesCount, newCounter: appModel.postsById[postId].postLikes },
      { btn: dislikeBtn, counter: dislikesCount, newCounter: appModel.postsById[postId].postDislikes }
    );
  }

  //  TODO wyślij odpowiedź do serwera
  //tu beziemy sprawdzać czy stan jest zgodny z odpoiwedzią serwera jeśli nie to trzeba zmienić tak jak jest na serwerze oraz może dać message co poszło nie tak
  /*
  np.
  ustawiliśmy liked (status) na 2, a na serwerze zwrócił 1, wtedy usuwamy liked z naszego statusu i odejmujemy jeden a następnie ustawiamy stan na 1 dodajemy tam jeden i dodajemy klasę liked*/

}


function heartPost(postId, postEl) {
  const heartsCount = postEl.querySelector('.heart-count');
  const heartBtn = postEl.querySelector('.heart-btn');

  const likedStatus = appModel.postsById[postId].liked;

  if (likedStatus == 0) {
    appModel.postsById[postId].liked = 1;
    appModel.postsById[postId].postHearts = Number(appModel.postsById[postId].postHearts) + 1;
    setClassesForReactionButtons({ btn: heartBtn, counter: heartsCount, newCounter: appModel.postsById[postId].postHearts });
  }
  else if (likedStatus == 1) {
    appModel.postsById[postId].liked = 0;
    appModel.postsById[postId].postHearts = Number(appModel.postsById[postId].postHearts) - 1;
    setClassesForReactionButtons(null, { btn: heartBtn, counter: heartsCount, newCounter: appModel.postsById[postId].postHearts });
  }
  else if (likedStatus == 2) {
    const likesCount = postEl.querySelector('.like-count');
    const likeBtn = postEl.querySelector('.like-btn');
    appModel.postsById[postId].liked = 1;
    appModel.postsById[postId].postHearts = Number(appModel.postsById[postId].postHearts) + 1;
    appModel.postsById[postId].postLikes = Number(appModel.postsById[postId].postLikes) - 1;

    setClassesForReactionButtons(
      { btn: heartBtn, counter: heartsCount, newCounter: appModel.postsById[postId].postHearts },
      { btn: likeBtn, counter: likesCount, newCounter: appModel.postsById[postId].postLikes }
    );
  }
  else if (likedStatus == 3) {
    const dislikesCount = postEl.querySelector('.dislike-count');
    const dislikeBtn = postEl.querySelector('.dislike-btn');
    appModel.postsById[postId].liked = 1;
    appModel.postsById[postId].postHearts = Number(appModel.postsById[postId].postHearts) + 1;
    appModel.postsById[postId].postDislikes = Number(appModel.postsById[postId].postDislikes) - 1;

    setClassesForReactionButtons(
      { btn: heartBtn, counter: heartsCount, newCounter: appModel.postsById[postId].postHearts },
      { btn: dislikeBtn, counter: dislikesCount, newCounter: appModel.postsById[postId].postDislikes }
    );
  }
}

function dislikePost(postId, postEl) {
  const dislikesCount = postEl.querySelector('.dislike-count');
  const dislikeBtn = postEl.querySelector('.dislike-btn');

  const likedStatus = appModel.postsById[postId].liked;

  if (likedStatus == 0) {
    appModel.postsById[postId].liked = 3;
    appModel.postsById[postId].postDislikes = Number(appModel.postsById[postId].postDislikes) + 1;
    setClassesForReactionButtons({ btn: dislikeBtn, counter: dislikesCount, newCounter: appModel.postsById[postId].postDislikes });
  }
  else if (likedStatus == 3) {
    appModel.postsById[postId].liked = 0;
    appModel.postsById[postId].postDislikes = Number(appModel.postsById[postId].postDislikes) - 1;
    setClassesForReactionButtons(null, { btn: dislikeBtn, counter: dislikesCount, newCounter: appModel.postsById[postId].postDislikes });
  }
  else if (likedStatus == 1) {
    const heartsCount = postEl.querySelector('.heart-count');
    const heartBtn = postEl.querySelector('.heart-btn');
    appModel.postsById[postId].liked = 3;
    appModel.postsById[postId].postDislikes = Number(appModel.postsById[postId].postDislikes) + 1;
    appModel.postsById[postId].postHearts = Number(appModel.postsById[postId].postHearts) - 1;

    setClassesForReactionButtons(
      { btn: dislikeBtn, counter: dislikesCount, newCounter: appModel.postsById[postId].postDislikes },
      { btn: heartBtn, counter: heartsCount, newCounter: appModel.postsById[postId].postHearts }
    );
  }
  else if (likedStatus == 2) {
    const likesCount = postEl.querySelector('.like-count');
    const likeBtn = postEl.querySelector('.like-btn');
    appModel.postsById[postId].liked = 3;
    appModel.postsById[postId].postDislikes = Number(appModel.postsById[postId].postDislikes) + 1;
    appModel.postsById[postId].postLikes = Number(appModel.postsById[postId].postLikes) - 1;

    setClassesForReactionButtons(
      { btn: dislikeBtn, counter: dislikesCount, newCounter: appModel.postsById[postId].postDislikes },
      { btn: likeBtn, counter: likesCount, newCounter: appModel.postsById[postId].postLikes }
    );
  }
}


setInterval(() => {
  console.log('App model:', appModel.postsById[30].liked);
}, 1000);