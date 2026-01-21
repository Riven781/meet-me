export async function fetchProfile(username) {
  console.log(`fetchProfile(${username})`);

  const url = `/api/profile/${encodeURIComponent(username)}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json();
}



export async function uploadProfileImage({ file, mode }) {

  const url =
    mode === 2
      ? "/api/profile/upload/avatar"
      : "/api/profile/upload/background";

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
}
