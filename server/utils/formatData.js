export function getPostData(post) {
  return {
    id: post.id,
    authorName: post.username,
    createdAt: post.createdAt ?? post.created_at,
    postText: post.text,
    postHearts: post.heart_count,
    postLikes: post.like_count,
    postDislikes: post.dislike_count,
    postComments: post.reply_count,
    observed: post.observed ?? false,
    saved: post.saved ?? false,
    liked: post.liked ?? 0,
    authorImage: post.avatar_img_url ?? "/avatars/default-avatar.jpg",
    isCreatedByUser: post.isCreatedByUser ?? false,           //czy jest to post autorski,
    liked: post.reaction ?? 0,
    lastModifiedAt: post.lastModifiedAt ?? post.last_modified_at,
    edited: post.edited
  }
}


export function getCommentData(comment) {
  return {
    id: comment.id,
    authorName: comment.username,
    commentText: comment.content,
    createdAt: comment.createdAt ?? comment.created_at,
    commentHearts: comment.heart_count,
    commentReplies: comment.reply_count,
    parentId: comment.parent_id,
    authorImage: comment.avatar_img_url ?? "/avatars/default-avatar.jpg",  //z bazy to pobrac trzeba bedzie
    isLiked: comment.heart_id ? true : false
  }
}

export function getProfileData(user) {
  return {
    username: user.username,
    authorImage: user.avatar_img_url ?? "/avatars/default-avatar.jpg",
    backgroundImage: user.background_img_url ?? null,
  }
}