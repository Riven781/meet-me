function setClassesForReactionButtons(elementsToAddClass, elementsToRemoveClass) {
  if (elementsToAddClass) {
    if (elementsToAddClass.btn) elementsToAddClass.btn.classList.add('liked');
    if (elementsToAddClass.counter) elementsToAddClass.counter.classList.add('liked');
    elementsToAddClass.counter.textContent = elementsToAddClass.newCounter;
  }

  if (elementsToRemoveClass) {
    if (elementsToRemoveClass.btn) elementsToRemoveClass.btn.classList.remove('liked');
    if (elementsToRemoveClass.counter) elementsToRemoveClass.counter.classList.remove('liked');
    elementsToRemoveClass.counter.textContent = elementsToRemoveClass.newCounter;
  }

}



//to funkcja optymistyczna
export function likePost(post, postEl) {  //post z appModel
  const likesCount = postEl.querySelector('.like-count');
  const likeBtn = postEl.querySelector('.like-btn');

  const likedStatus = post.liked;

  if (likedStatus === 0) {
    post.liked = 2;
    post.postLikes = Number(post.postLikes) + 1;
    setClassesForReactionButtons({ btn: likeBtn, counter: likesCount, newCounter: post.postLikes });
  }
  else if (likedStatus === 2) {
    post.liked = 0;
    post.postLikes = Number(post.postLikes) - 1;
    setClassesForReactionButtons(null, { btn: likeBtn, counter: likesCount, newCounter: post.postLikes });
  }
  else if (likedStatus === 1) {
    const heartsCount = postEl.querySelector('.heart-count');
    const heartBtn = postEl.querySelector('.heart-btn');
    post.liked = 2;
    post.postLikes = Number(post.postLikes) + 1;
    post.postHearts = Number(post.postHearts) - 1;

    setClassesForReactionButtons(
      { btn: likeBtn, counter: likesCount, newCounter: post.postLikes },
      { btn: heartBtn, counter: heartsCount, newCounter: post.postHearts }
    );
  }
  else if (likedStatus === 3) {
    const dislikesCount = postEl.querySelector('.dislike-count');
    const dislikeBtn = postEl.querySelector('.dislike-btn');
    post.liked = 2;
    post.postLikes = Number(post.postLikes) + 1;
    post.postDislikes = Number(post.postDislikes) - 1;

    setClassesForReactionButtons(
      { btn: likeBtn, counter: likesCount, newCounter: post.postLikes },
      { btn: dislikeBtn, counter: dislikesCount, newCounter: post.postDislikes }
    );
  }
}



export function heartPost(post, postEl) {
  const heartsCount = postEl.querySelector('.heart-count');
  const heartBtn = postEl.querySelector('.heart-btn');

  const likedStatus = post.liked;

  if (likedStatus == 0) {
    post.liked = 1;
    post.postHearts = Number(post.postHearts) + 1;
    setClassesForReactionButtons({ btn: heartBtn, counter: heartsCount, newCounter: post.postHearts });
  }
  else if (likedStatus == 1) {
    post.liked = 0;
    post.postHearts = Number(post.postHearts) - 1;
    setClassesForReactionButtons(null, { btn: heartBtn, counter: heartsCount, newCounter: post.postHearts });
  }
  else if (likedStatus == 2) {
    const likesCount = postEl.querySelector('.like-count');
    const likeBtn = postEl.querySelector('.like-btn');
    post.liked = 1;
    post.postHearts = Number(post.postHearts) + 1;
    post.postLikes = Number(post.postLikes) - 1;

    setClassesForReactionButtons(
      { btn: heartBtn, counter: heartsCount, newCounter: post.postHearts },
      { btn: likeBtn, counter: likesCount, newCounter: post.postLikes }
    );
  }
  else if (likedStatus == 3) {
    const dislikesCount = postEl.querySelector('.dislike-count');
    const dislikeBtn = postEl.querySelector('.dislike-btn');
    post.liked = 1;
    post.postHearts = Number(post.postHearts) + 1;
    post.postDislikes = Number(post.postDislikes) - 1;

    setClassesForReactionButtons(
      { btn: heartBtn, counter: heartsCount, newCounter: post.postHearts },
      { btn: dislikeBtn, counter: dislikesCount, newCounter: post.postDislikes }
    );
  }
}

export function dislikePost(post, postEl) {
  const dislikesCount = postEl.querySelector('.dislike-count');
  const dislikeBtn = postEl.querySelector('.dislike-btn');

  const likedStatus = post.liked;

  if (likedStatus == 0) {
    post.liked = 3;
    post.postDislikes = Number(post.postDislikes) + 1;
    setClassesForReactionButtons({ btn: dislikeBtn, counter: dislikesCount, newCounter: post.postDislikes });
  }
  else if (likedStatus == 3) {
    post.liked = 0;
    post.postDislikes = Number(post.postDislikes) - 1;
    setClassesForReactionButtons(null, { btn: dislikeBtn, counter: dislikesCount, newCounter: post.postDislikes });
  }
  else if (likedStatus == 1) {
    const heartsCount = postEl.querySelector('.heart-count');
    const heartBtn = postEl.querySelector('.heart-btn');
    post.liked = 3;
    post.postDislikes = Number(post.postDislikes) + 1;
    post.postHearts = Number(post.postHearts) - 1;

    setClassesForReactionButtons(
      { btn: dislikeBtn, counter: dislikesCount, newCounter: post.postDislikes },
      { btn: heartBtn, counter: heartsCount, newCounter: post.postHearts }
    );
  }
  else if (likedStatus == 2) {
    const likesCount = postEl.querySelector('.like-count');
    const likeBtn = postEl.querySelector('.like-btn');
    post.liked = 3;
    post.postDislikes = Number(post.postDislikes) + 1;
    post.postLikes = Number(post.postLikes) - 1;

    setClassesForReactionButtons(
      { btn: dislikeBtn, counter: dislikesCount, newCounter: post.postDislikes },
      { btn: likeBtn, counter: likesCount, newCounter: post.postLikes }
    );
  }
}





function setLike(post, postEl) {
  const likesCount = postEl.querySelector('.like-count');
  const likeBtn = postEl.querySelector('.like-btn');
  post.liked = 2;
  post.postLikes = Number(post.postLikes) + 1;
  setClassesForReactionButtons({ btn: likeBtn, counter: likesCount, newCounter: post.postLikes });
}

function setHeart(post, postEl) {
  const heartsCount = postEl.querySelector('.heart-count');
  const heartBtn = postEl.querySelector('.heart-btn');
  post.liked = 1;
  post.postHearts = Number(post.postHearts) + 1;
  setClassesForReactionButtons({ btn: heartBtn, counter: heartsCount, newCounter: post.postHearts });
}

function setDislike(post, postEl) {
  const dislikesCount = postEl.querySelector('.dislike-count');
  const dislikeBtn = postEl.querySelector('.dislike-btn');
  post.liked = 3;
  post.postDislikes = Number(post.postDislikes) + 1;
  setClassesForReactionButtons({ btn: dislikeBtn, counter: dislikesCount, newCounter: post.postDislikes });
}

function removeLike(post, postEl) {
  const likesCount = postEl.querySelector('.like-count');
  const likeBtn = postEl.querySelector('.like-btn');
  post.liked = 0;
  post.postLikes = Number(post.postLikes) - 1;
  setClassesForReactionButtons(null, { btn: likeBtn, counter: likesCount, newCounter: post.postLikes });
}

function removeHeart(post, postEl) {
  const heartsCount = postEl.querySelector('.heart-count');
  const heartBtn = postEl.querySelector('.heart-btn');
  post.liked = 0;
  post.postHearts = Number(post.postHearts) - 1;
  setClassesForReactionButtons(null, { btn: heartBtn, counter: heartsCount, newCounter: post.postHearts });
}

function removeDislike(post, postEl) {
  const dislikesCount = postEl.querySelector('.dislike-count');
  const dislikeBtn = postEl.querySelector('.dislike-btn');
  post.liked = 0;
  post.postDislikes = Number(post.postDislikes) - 1;
  setClassesForReactionButtons(null, { btn: dislikeBtn, counter: dislikesCount, newCounter: post.postDislikes });
}

export function synchronizeReactions(prev, newReaction, post, postEl) {
  if (prev === 0) {
    if (newReaction === 1) {
      setHeart(post, postEl);
    }
    else if (newReaction === 2) {
      setLike(post, postEl);
    }
    else if (newReaction === 3) {
      setDislike(post, postEl);
    }
  }
  else if (prev === 1) {
    removeHeart(post, postEl);
    if (newReaction === 2) {
      setLike(post, postEl);
    }
    else if (newReaction === 3) {
      setDislike(post, postEl);
    }
  }
  else if (prev === 2) {
    removeLike(post, postEl);
    if (newReaction === 1) {
      setHeart(post, postEl);
    }
    else if (newReaction === 3) {
      setDislike(post, postEl);
    }
  }
  else if (prev === 3) {
    removeDislike(post, postEl);
    if (newReaction === 1) {
      setHeart(post, postEl);
    }
    else if (newReaction === 2) {
      setLike(post, postEl);
    }
  }
}
