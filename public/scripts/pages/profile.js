import { loadProfile, onProfileImageSubmit } from "../controller/profile.controller.js";

function getUsername() {
  const pathParts = window.location.pathname.split('/');
  const profileIndex = pathParts.indexOf('profile');
  return pathParts[profileIndex + 1];
}

function getUserFromCookie() {
  const cookie = document.cookie;

  return cookie.split('=')[1];
}


loadProfile(getUsername());


const setImgBtns = document.querySelectorAll('.set-img-btn');


if (getUserFromCookie() !== getUsername()) {
  setImgBtns.forEach(btn => btn.style.display = 'none');
  const postForm = document.querySelector('.post-form');
  postForm.style.display = 'none';
}


const BACKGROUND_MODE = 1;
const AVATAR_MODE = 2;

let mode = AVATAR_MODE;

const setAvatarImgBtn = document.getElementById('set-avatar-img-btn');
setAvatarImgBtn.addEventListener('click', () => {
  console.log('click avatar');
  document.body.style.overflow = 'hidden';
  document.querySelector('.set-img-container').style.display = 'grid';
  img.classList.remove('background-img');
  img.classList.add('author-image-large');
  mode = AVATAR_MODE;
});
const img = document.getElementById('img-to-set');
const setBackgroundImgBtn = document.getElementById('set-background-img-btn');
setBackgroundImgBtn.addEventListener('click', () => {
  console.log('click background');
  document.body.style.overflow = 'hidden';
  document.querySelector('.set-img-container').style.display = 'grid';
  img.classList.add('background-img');
  img.classList.remove('author-image-large');
  mode = BACKGROUND_MODE;
});
const fileInput = document.getElementById('file-input');
let previewURl = null;

const cancelBtn = document.getElementById('cancel-btn');
cancelBtn.addEventListener('click', () => {
  document.body.style.overflow = 'auto';
  document.querySelector('.set-img-container').style.display = 'none';
  if (fileInput.files.length > 0) {
    fileInput.value = null;
  }
  img.style.display = 'none';

});



const form = document.getElementById('upload-form');



fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (previewURl) {
    URL.revokeObjectURL(previewURl);
  }

  previewURl = URL.createObjectURL(file);

  img.style.display = 'block';
  img.src = previewURl;

})


form.addEventListener('submit', async (e) => {
  e.preventDefault();

  onProfileImageSubmit(fileInput, mode);


});

