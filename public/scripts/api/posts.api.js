
export async function fetchPosts({ limit = 5, lastPostCursor = null, username = "" } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));

  if (lastPostCursor) params.set("lastPostCursor", lastPostCursor);
  if (username) params.set("username", username);

  const url = `/api/getPosts?${params.toString()}`;

  const res = await fetch(url, { method: "GET" });


  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json(); // { posts, nextPostCursor }
}


export async function publishPost(text) {
  const url = "/api/createPost";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `POST ${url} failed: ${res.status} ${res.statusText} ${errText}`
    );
  }

  return res.json(); // { post }
}



export async function sendReaction({ postId, reactionType }) {
  const url = "/api/reaction";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, reactionType }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }


  return res.json();
}



export async function updatePost({ postId, content }) {
  const url = `/api/posts/${encodeURIComponent(postId)}`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PATCH ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json();
}



export async function deletePost(postId) {
  const url = `/api/posts/${encodeURIComponent(postId)}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DELETE ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
}
