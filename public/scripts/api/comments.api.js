

export async function postComment(body) {
  const url = "/api/postComment";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json(); // { comment }
}



export async function fetchComments({ postId, limit = 5, lastCommentCursor = null } = {}) {
  if (!postId) throw new Error("fetchComments: postId is required");

  const params = new URLSearchParams();
  params.set("postId", String(postId));
  params.set("limit", String(limit));
  if (lastCommentCursor) params.set("lastCommentCursor", lastCommentCursor);

  const url = `/api/getComments?${params.toString()}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json(); // { comments, nextCommentCursor }
}


export async function fetchReplies({
  postId,
  parentId,
  limit = 5,
  lastCommentCursor = null,
} = {}) {
  if (!postId) throw new Error("fetchReplies: postId is required");
  if (!parentId) throw new Error("fetchReplies: parentId (commentId) is required");

  const params = new URLSearchParams();
  params.set("postId", String(postId));
  params.set("parentId", String(parentId));
  params.set("limit", String(limit));
  if (lastCommentCursor) params.set("lastCommentCursor", lastCommentCursor);

  const url = `/api/getComments?${params.toString()}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json(); // { comments, nextCommentCursor }
}


export async function likeComment(commentId) {
  const url = `/api/comments/${encodeURIComponent(commentId)}/like`;

  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PUT ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
}

export async function unlikeComment(commentId) {
  const url = `/api/comments/${encodeURIComponent(commentId)}/like`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DELETE ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
}
