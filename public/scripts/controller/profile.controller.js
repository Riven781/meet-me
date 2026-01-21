import { fetchProfile, uploadProfileImage } from "../api/profile.api.js";


export async function loadProfile(username) {
  try {
    const data = await fetchProfile(username);

    console.log(data);

    const userProfile = data?.user;

    if (!userProfile) {
      window.location.href = "/meet-me/posts";
      return;
    }

    const nameEl = document.querySelector(".author-name");
    if (nameEl) nameEl.innerText = userProfile.username ?? "";

    const avatarEl = document.querySelector(".author-image-large");
    if (avatarEl) avatarEl.src = userProfile.authorImage ?? "";

    const backgroundImg = document.querySelector(".background-img-large");
    if (backgroundImg) {
      if (userProfile.backgroundImage) {
        backgroundImg.style.display = "block";
        backgroundImg.src = userProfile.backgroundImage;
      } else {
        backgroundImg.style.display = "none";
        backgroundImg.removeAttribute("src");
      }
    }
  } catch (err) {
    console.error(err);
    window.location.href = "/meet-me/posts";
  }
}



export async function onProfileImageSubmit(fileInput, mode) {
  const file = fileInput?.files?.[0];
  if (!file) {
    alert("Please select an image file.");
    return;
  }

  try {
    await uploadProfileImage({ file, mode });

    document.body.style.overflow = "auto";

    const modal = document.querySelector(".set-img-container");
    if (modal) modal.style.display = "none";

    location.reload();
  } catch (err) {
    console.error(err);
  }
}
