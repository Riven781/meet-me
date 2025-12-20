const textarea = document.getElementById("post-text");
const postBtn = document.getElementById("post-btn");

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