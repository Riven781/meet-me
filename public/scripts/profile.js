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
  } catch (err) {
    console.error(err);
  }
}


loadProfile(getUsername());


const setImgBtn = document.querySelector('.set-img-btn');

if (getUserFromCookie() !== getUsername()) {
  setImgBtn.style.display = 'none';
}


setImgBtn.addEventListener('click', () => {
  document.body.style.overflow = 'hidden';
  document.querySelector('.set-img-container').style.display = 'grid';

});


const cancelBtn = document.getElementById('cancel-btn');
cancelBtn.addEventListener('click', () => {
  document.body.style.overflow = 'auto';
  document.querySelector('.set-img-container').style.display = 'none';
});




let previewURl = null;

const form = document.getElementById('upload-form');

const img = document.getElementById('img-to-set');

const fileInput = document.getElementById('file-input');

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
    const res = await fetch('/api/profile/upload/avatar', {
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

