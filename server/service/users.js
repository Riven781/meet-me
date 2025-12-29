import e from 'express';
import { createUser, getCommentById, getComments, getPostById, getPosts, getReplies, getUserByEmailAndPassword, getUserByUsernameAndPassword, insertComment, insertPost, setReaction, likeComment, unlikeComment, findUserByUsername, getPostsByUsername } from '../repository/users.js'


export async function registerUser(user) {
  const { errors, isValid } = validateUser(user);
  if (!isValid) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      errors
    };
  }

  try {
    const userId = await createUser(user);
    console.log(`userId: ${userId}`);
    return {
      ok: true,
      userId
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const message = error.sqlMessage;
      const field = message.includes('username') ? 'username' : message.includes('email') ? 'email' : 'unknown';
      return {
        ok: false,
        code: 'USER_ALREADY_EXISTS',
        errors: field !== 'unknown'
          ? { [field]: `User with this ${field} already exists` }
          : { [field]: "User already exists" }
      }
    }
    throw error;
  }
}

export async function loginUser(userData) {
  const { usernameOrEmail, password } = userData;
  try {
    let user;
    if (usernameOrEmail.includes('@')) {
      user = await getUserByEmailAndPassword(usernameOrEmail, password);
    } else {
      user = await getUserByUsernameAndPassword(usernameOrEmail, password);
    }
    if (!user) {
      return {
        ok: false,
        code: "USER_NOT_FOUND",
        errors: {
          usernameOrEmail: "User not found"
        }
      }
    } else {
      return {
        ok: true,
        userId: user.id,
        username: user.username
      }
    }
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      code: "USER_NOT_FOUND_ERROR",
      errors: {
        usernameOrEmail: "User not found"
      }
    }
  }
}

export async function createPost(userId, text) {
  let postId;
  try {
    postId = await insertPost({ user_id: userId, text });
    console.log(` postId: ${postId}`);
    if (!postId) {
      return {
        ok: false,
        code: "POST_NOT_CREATED",
        errors: {
          text: "Post not created"
        }
      }
    }

  } catch (error) {
    console.error(error);
    return {
      ok: false,
      code: "POST_NOT_CREATED_ERROR",
      errors: {
        text: "Post not created"
      }
    }
  }


  try {
    const postData = await getPostById(postId);

    if (postData) {
      return {
        ok: true,
        postId,
        postData: getPostData(postData, true),
        code: "POST_CREATED"
      }
    }
    else {
      return {
        ok: true,
        code: "POST_CREATED_BUT_NOT_FOUND",

      }
    }
  } catch (error) {
    return {
      ok: true,
      code: "POST_CREATED_BUT_NOT_FOUND",

    };
  }

}

export async function getFeed(userId, limit = 20, lastPostCursor = null) {
  try {
    const data = await getPosts(userId, limit, lastPostCursor);
    if (data.posts.length > 0) {
      const formattedPosts = data.posts.map(post => getPostData(post));
      return {
        ok: true,
        posts: formattedPosts,
        code: "POSTS_FOUND",
        nextPostCursor: data.nextPostCursor
      }
    }
    else {
      return {
        ok: true,
        code: "NO_POSTS_FOUND",
        posts: [],
        nextPostCursor: null
      }
    }
  } catch (error) {
    return {
      ok: false,
      code: "POSTS_NOT_FOUND_ERROR",
      errors: {
        text: "Posts not found"
      }
    }
  }

}

export async function getPostByUser(userId, username, limit = 20, lastPostCursor = null) {
  try {
    const data = await getPostsByUsername(userId, username, limit, lastPostCursor);
    if (data.posts.length > 0) {
      const formattedPosts = data.posts.map(post => getPostData(post));
      return {
        ok: true,
        posts: formattedPosts,
        code: "POSTS_FOUND",
        nextPostCursor: data.nextPostCursor
      }
    }
    else {
      return {
        ok: true,
        code: "NO_POSTS_FOUND",
        posts: [],
        nextPostCursor: null
      }
    }
  } catch (error) {
    return {
      ok: false,
      code: "POSTS_NOT_FOUND_ERROR",
      errors: {
        text: "Posts not found"
      }
    }
  }
  
  
}


export async function getCommentsForPost(postId, limit = 20, lastCommentCursor = null) {
  try {
    const data = await getComments(postId, limit, lastCommentCursor);
    const rows = data.comments;
    if (rows.length > 0) {

      const formattedComments = rows.map(comment => getCommentData(comment));
      return {
        ok: true,
        comments: formattedComments,
        code: "COMMENTS_FOUND",
        nextCommentCursor: data.nextCommentCursor
      }
    }
    else {
      return {
        ok: true,
        code: "NO_COMMENTS_FOUND",
        comments: [],
        nextCommentCursor: null
      }
    }
  } catch (error) {
    return {
      ok: false,
      code: "COMMENTS_NOT_FOUND_ERROR",
      errors: {
        text: "Comments not found"
      }
    }
  }
}

export async function getRepliesForComment(parentId, limit = 20, lastCommentCursor = null) {
  try {
    const data = await getReplies(parentId, limit, lastCommentCursor);
    const rows = data.comments;
    if (rows.length > 0) {

      const formattedComments = rows.map(comment => getCommentData(comment));
      return {
        ok: true,
        comments: formattedComments,
        code: "COMMENTS_FOUND",
        nextCommentCursor: data.nextCommentCursor
      }
    }
    else {
      return {
        ok: true,
        code: "NO_COMMENTS_FOUND",
        comments: [],
        nextCommentCursor: null
      }
    }
  } catch (error) {
    return {
      ok: false,
      code: "COMMENTS_NOT_FOUND_ERROR",
errors: {
      text: error?.message ?? "Comments not found",
      sqlMessage: error?.sqlMessage,
      code: error?.code,
    }
    }
  }
}


export async function publishComment(userId, postId, content, parentId = null, replyToCommentId = null) {
  try {
    if (replyToCommentId != null) {
      try {
        const commentReply = await getCommentById(replyToCommentId);
        const authorId = commentReply.user_id;
        if (authorId !== userId) {
          console.log(` authorId: ${authorId}, userId: ${userId}`);
          content = `@${commentReply.username} ${content}`;
        }
      }
      catch (e) {
        console.error('Reply to comment not found');
      }
    }

    const commentId = await insertComment({ user_id: userId, post_id: postId, content, parent_id: parentId });


    let comment = null;
    try {
      comment = await getCommentById(commentId);
    } catch (error) {
      console.error(error);
    }

    return {
      ok: true,
      commentId,
      comment: comment ? getCommentData(comment) : null,
      code: "COMMENT_CREATED"
    }
  } catch (error) {
    return {
      ok: false,
      code: "COMMENT_NOT_CREATED_ERROR",
      errors: {
        text: "Comment not created"
      }
    }
  }
}




export async function setReactionToPost(userId, postId, reactionType) {
  const reaction = await setReaction({ userId, postId, reactionType });
  return {
    ok: true,
    code: "REACTION_SET",
    reaction: reaction  /*mozna sprawdzic czy dobrze dodajac 1 i sprawdzic czy w ui sie zgadza*/
  }
}

function getCommentData(comment) {
  return {
    id: comment.id,
    authorName: comment.username,
    commentText: comment.content,
    createdAt: comment.created_at,
    commentHearts: comment.heart_count,
    commentReplies: comment.reply_count,
    parentId: comment.parent_id,
    authorImage: comment.avatar_img_url ?? "/avatars/default-avatar.jpg",  //z bazy to pobrac trzeba bedzie
    isLiked: comment.heart_id ? true : false
  }
}

function getProfileData(user){
  return{
    username: user.username,
    authorImage: user.avatar_img_url ?? "/avatars/default-avatar.jpg",
    backgroundImage: user.background_img_url ?? "/images/default-avatar.jpg",
  }
}


function getPostData(post) {
  return {
    id: post.id,
    authorName: post.username,
    createdAt: post.created_at,
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
    liked: post.reaction ?? 0
  }
}



function validateUser(user) {
  const errors = {}
  const { username, email, password, first_name, last_name } = user;

  if (username.includes(' ')) {
    errors.username = 'Username cannot contain spaces';
  }
  else if (username.length < 3 || username.length > 50) {
    errors.username = 'Username must be between 3 and 50 characters long';
  }

  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (first_name.length > 50) {
    errors.first_name = 'First name cannot be longer than 50 characters';
  }

  if (last_name.length > 50) {
    errors.last_name = 'Last name cannot be longer than 50 characters';
  }



  if (!email.includes('@') || !email.includes('.')) {
    errors.email = 'Email is not valid';
  } else if (email.length > 200) {
    errors.email = 'Email cannot be longer than 200 characters';
  }


  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };

}

export async function addCommentLike(userId, commentId) {
  try {
    console.log(`addCommentLike(${userId}, ${commentId})`);
    const result = await likeComment(userId, commentId);
    return {
      ok: true,
      code: "COMMENT_LIKED"
    }
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      code: "COMMENT_LIKE_FAILED",
      errors: {
        text: "Comment not liked"
      }
    }
  }
}

export async function removeCommentLike(userId, commentId) {
  try {
    console.log(`removeCommentLike(${userId}, ${commentId})`);
    const result = await unlikeComment(userId, commentId);
    console.log(result);
    return {
      ok: true,
      code: "COMMENT_UNLIKED"
    }
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      code: "COMMENT_UNLIKE_FAILED",
      errors: {
        text: "Comment not unliked"
      }
    }
  }
}

export async function getUserByUsername(username) {
  try{
    const user = await findUserByUsername(username);
    //console.log(user);
    //console.log(user.username);
    if (!user) {
      console.log("user not found ---");
      return {
        ok: false,
        code: "USER_NOT_FOUND",
        errors: {
          username: "User not found"
        }
      }
    }
    return {
      ok: true,
      code: "USER_FOUND",
      user : getProfileData(user)
    }
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      code: "USER_NOT_FOUND",
      errors: {
        username: "User not found"
      }
    }
  }
}