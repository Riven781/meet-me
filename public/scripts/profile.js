function getUsername() {
  const pathParts = window.location.pathname.split('/');
  const profileIndex = pathParts.indexOf('profile');
  return pathParts[profileIndex + 1];
}

function getUserFromCookie() {
  const cookie = document.cookie;

  return cookie.split('=')[1];
}


async function loadProfile(username) {
  try {
    const res = await fetch(`/api/profile/${username}`);
    if (!res.ok) {
      window.location.href = '/meet-me/posts';
      //throw new Error("Profile not found");
    }

    const data = await res.json();



    const userProfile = data.user;


    document.querySelector('.author-name').innerText = userProfile.username;

    document.querySelector('.author-image-large').src = userProfile.authorImage;

    if (userProfile.backgroundImage) {
      console.log(`backgroundImage: ${userProfile.backgroundImage}`);
      const backgroundImg = document.querySelector('.background-img-large');
      backgroundImg.style.display = 'block';
      backgroundImg.src = userProfile.backgroundImage;
    }
    else{
      console.log(`backgroundImage:e nul}`);
    }

  } catch (err) {
    console.error(err);
  }
}


loadProfile(getUsername());


const setImgBtns = document.querySelectorAll('.set-img-btn');


if (getUserFromCookie() !== getUsername()) {
  setImgBtns.forEach(btn => btn.style.display = 'none');
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
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select an image file.');
    return;
  }


  const formData = new FormData();
  formData.append('image', file);

  try {
    const url = mode === AVATAR_MODE ? '/api/profile/upload/avatar' : '/api/profile/upload/background';
    const res = await fetch(url, {
      method: 'POST',
      body: formData,

    });

    if (res.ok) {
      document.body.style.overflow = 'auto';
      document.querySelector('.set-img-container').style.display = 'none';
      location.reload();
      console.log('Image uploaded successfully');
    } else {
      console.error('Error uploading image');
    }
  } catch (err) {
    console.error(err);
  }
});

