import { fetchPosts } from "../api/posts.api.js";
import { onLogout } from "../controller/auth.controller.js";
import { loadComments, loadReplies, onCommentSubmit, toggleCommentHeartController } from "../controller/comments.controller.js";
import { loadPosts, onDeletePost, onPublishClick, savePostEdit } from "../controller/posts.controller.js";
import { toggleReaction } from "../controller/reactions.controller.js";
import { appModel } from "../models/appModel.js";

const textarea = document.getElementById("post-text");
const postBtn = document.getElementById("post-btn");
const commentBtn = document.getElementsByClassName("comment-btn");
const accountBtn = document.getElementById("account-btn");
let username = isProfileMode();

appModel.username = username;



function isProfileMode() {
  const pathParts = window.location.pathname.split('/');
  console.log(pathParts);
  const profileIndex = pathParts.indexOf('profile');
  console.log(profileIndex);

  if (profileIndex === -1 || !pathParts[profileIndex + 1]) {
    console.log(pathParts[profileIndex + 1]);
    return '';
  }
  else {
    return pathParts[profileIndex + 1];

  }
}


accountBtn.addEventListener("click", () => {
  const accountMenu = document.querySelector(".account-menu");
  console.log(accountMenu);

  const isHidden = getComputedStyle(accountMenu).display === "none";

  accountMenu.style.display = isHidden ? "flex" : "none";

});

console.log(`document.cookie tttt = ${document.cookie}`);

function getUserFromCookie() {
  const cookie = document.cookie;

  return cookie.split('=')[1];
}





const accountLink = document.querySelector(".account-link");
accountLink.href = "/meet-me/profile/" + getUserFromCookie();

accountLink.addEventListener("click", () => {
  const accountMenu = document.querySelector(".account-menu");
  accountMenu.style.display = "none";
});

const logoutBtn = document.querySelector(".logout-btn");

logoutBtn.addEventListener("click", async () => {
  onLogout();
});


const maxHeight = 300;




postBtn.parentElement.classList.toggle('show', textarea.value.trim() !== '');



postBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const container = document.querySelector('.posts');

  onPublishClick(textarea, container);

  postBtn.parentElement.classList.toggle('show', textarea.value.trim() !== '');



});



textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';  //tyle ile potrzebuje
  textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';  //ograniccz

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




const postEnd = document.getElementById('feed-end');

loadPosts(postEnd);
window.scrollTo(0, 0);




const observer = new IntersectionObserver((entries) => {
  const entry = entries[0];
  console.log('observing');
  console.log(entry.isIntersecting);

  if (entry.isIntersecting) loadPosts(postEnd);
}, {
  root: null, //sprawdza czy element jest widoczny w oknie przeglądarki
  rootMargin: "200px",   //200px przed końcem strony pozwala na ładowanie nowych postów
  threshold: 0.01
});

observer.observe(postEnd);






function clearComments(postEl) {
  const container = postEl.querySelector('.comments');
  container.classList.remove('active');
  container.innerHTML = '';
}


const optionMenu = {};

document.querySelector('.posts').addEventListener('click', async (e) => {
  if (e.target.matches(".comment-btn")) {
    console.log('comment btn');
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    const currentPostId = postEl.dataset.postId;

    appModel.repliesByCommentId = {};


    appModel.commentsById = {};  //swiezo dodane


    for (const postId in appModel.commentsByPostId) {
      console.log("blee");
      if (postId == currentPostId) continue;
      delete appModel.commentsByPostId[postId];
      const commentsToClose = document.querySelector(`.post-container[data-post-id="${postId}"]`);
      if (commentsToClose) clearComments(commentsToClose);
    }
    requestAnimationFrame(() => {
      postEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if (appModel.commentsByPostId[currentPostId]) {

      console.log('comments already loaded - removing');
      console.log('already loaded');
      delete appModel.commentsByPostId[currentPostId];
      clearComments(postEl);
    }
    else {
      console.log('loading comments');
      loadComments(currentPostId, postEl, true);
    }
  }

  if (e.target.closest(".more-replies-btn")) { //czasami zdarzenie matchowało span lub svg a nie button
    console.log('more replies');
    const commentEl = e.target.closest(".comment-container");
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    const commentId = commentEl.dataset.commentId;
    console.log(commentEl);
    loadReplies(postId, commentId, commentEl);
  }

  if (e.target.closest(".more-comments-btn")) {
    console.log('more comments');

    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    loadComments(postId, postEl, false);
  }

  if (e.target.matches(".like-btn")) {

    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    toggleReaction({ postId, postEl, target: "like" });
  }


  if (e.target.matches(".heart-btn")) {

    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    toggleReaction({ postId, postEl, target: "heart" });

  }

  if (e.target.matches(".dislike-btn")) {

    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    toggleReaction({ postId, postEl, target: "dislike" }).catch(console.error);
  }

  //USUNIETE FUNKCJE - do dodania w przyszlosci
  /*
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
    }*/

  /*if (e.target.matches(".undo-btn")) {
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
  }*/
  /*
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
    }*/

  if (e.target.matches(".heart-comment-btn")) {

    const btnEl = e.target.closest(".heart-comment-btn");
    toggleCommentHeartController(btnEl);


  }


  if (e.target.matches("#create-comment-btn")) {
    e.preventDefault();
    const postEl = e.target.closest(".post-container");
    const textarea = postEl.querySelector('#comment-text');
    const postId = postEl.dataset.postId;
    onCommentSubmit(postId, postEl, textarea);

  }

  if (e.target.matches(".reply-btn")) {
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    const commentEl = e.target.closest(".comment-container");
    const replyEl = e.target.closest(".comment-reply");
    const commentId = replyEl ? replyEl.dataset.commentId : commentEl.dataset.commentId;

    console.log('reply to comment', commentId);

    const labelArea = postEl.querySelector('.label-area');

    appModel.postsById[postId].replyToComment = {
      replyToCommentId: commentId,
      parentId: commentEl.dataset.commentId
    };

    labelArea.style.display = 'flex';
    labelArea.querySelector('.reply-label').textContent = `Replying to ${appModel.commentsById[commentId].authorName}:`;

    const comment = appModel.commentsById[commentId];

    const textarea = postEl.querySelector('#comment-text');


    textarea.focus();
  }

  if (e.target.matches(".exit-btn")) {
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    const labelArea = postEl.querySelector('.label-area');

    appModel.postsById[postId].replyToComment = {};

    labelArea.style.display = 'none';


  }


  if (e.target.matches('.delete-btn')) {
    const postEl = e.target.closest(".post-container");

    onDeletePost(postEl, optionMenu);


  }

  if (e.target.matches('.edit-btn')) {
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    const postContent = postEl.querySelector('.post-content p');
    postContent.contentEditable = true;
    postContent.classList.add('editable');
    const editingContainer = postEl.querySelector('.editing-container');
    editingContainer.style.display = 'flex';
  }

  if (e.target.matches('.save-edit-btn')) {
    const postEl = e.target.closest(".post-container");
    savePostEdit(postEl);

  }

  if (e.target.matches('.discard-btn')) {

    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;
    const postContent = postEl.querySelector('.post-content p');
    postContent.contentEditable = false;
    postContent.classList.remove('editable');
    postContent.textContent = appModel.postsById[postId].postText;
    const editingContainer = postEl.querySelector('.editing-container');
    editingContainer.style.display = 'none';

  }


  if (e.target.matches(".action-post-btn")) {

    const actionBtn = e.target;
    const postEl = e.target.closest(".post-container");
    const postId = postEl.dataset.postId;

    if (optionMenu.postId && optionMenu.postId === postId) {
      removeOptionsMenu();
      optionMenu.postId = null;
      return;
    }
    else if (optionMenu.postId && optionMenu.postId !== postId) {
      removeOptionsMenu();
    }

    optionMenu.postId = postId;
    createOptionsMenu(postId, actionBtn);
  } else {
    if (optionMenu.postId) {
      removeOptionsMenu();
      optionMenu.postId = null;
    }
  }
})


function createOptionsMenu(postId, actionBtn) {

  const menuOptions = document.createElement('div');
  menuOptions.classList.add('menu-options');

  const editBtn = document.createElement('button');
  editBtn.classList.add('option-btn');
  editBtn.classList.add('edit-btn');

  editBtn.textContent = 'Edit';
  menuOptions.appendChild(editBtn);

  const deleteBtn = document.createElement('button');

  deleteBtn.textContent = 'Delete';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.classList.add('option-btn');
  menuOptions.appendChild(deleteBtn);
  const header = actionBtn.closest(".post-header");
  header.appendChild(menuOptions);


  //actionBtn.nextSibling.appendChild(menuOptions);

}

function removeOptionsMenu() {

  document.querySelector('.menu-options').remove();
}


