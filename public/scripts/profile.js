function getUsername(){
  const pathParts = window.location.pathname.split('/');
  const profileIndex = pathParts.indexOf('profile');
  return pathParts[profileIndex + 1];
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