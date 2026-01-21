import { sendReaction } from "../api/posts.api.js";
import { dislikePost, heartPost, likePost, synchronizeReactions } from "../components/reactions.components.js";
import { appModel } from "../models/appModel.js";

const TARGET_TO_REACTION = {
  heart: 1,
  like: 2,
  dislike: 3,
};

function applyOptimisticToggle(targetReaction, postId, postEl) {
  const post = appModel.postsById[postId];
  if (targetReaction === 1) heartPost(post, postEl);
  else if (targetReaction === 2) likePost(post, postEl);
  else if (targetReaction === 3) dislikePost(post, postEl);
}

function computeReactionType(targetReaction, currentLiked) {
  return currentLiked === targetReaction ? 0 : targetReaction;
}
/*
confirmedReaction -- reakcja z serwera (przy wczytywaniu postów lub przy odpowiedzi serwera po reakcji)
liked -- reakcja w ui

przy błedach confirmedreaction musi aktualizować liked
*/

//todo:dodaj id do requestów aby stare reakcje z serwera nie psuły 

//target: "like" | "heart" | "dislike"
export async function toggleReaction({ postId, postEl, target }) {
  const post = appModel.postsById[postId];
  if (!post) return;

  const targetReaction = TARGET_TO_REACTION[target];
  if (!targetReaction) throw new Error(`Unknown target reaction: ${target}`);

  const previousReaction = post.liked ?? 0;
  const reactionType = computeReactionType(targetReaction, previousReaction);

  applyOptimisticToggle(targetReaction, postId, postEl);

  const optimisticReaction = post.liked ?? 0;

  try {
    const data = await sendReaction({ postId, reactionType });

    const serverReaction =
      typeof data.reaction === "number" ? data.reaction : previousReaction;


    if (typeof data.reaction === "number") {
      post.confirmedReaction = data.reaction;
    }
    
    //console.log("response for request:", { optimisticReaction, current: post.liked, serverReaction });

    // jeśli update optymistyczny jest inny niz na serwerze to trzeba synchronizować
    if (serverReaction !== optimisticReaction) {
      synchronizeReactions(optimisticReaction, serverReaction, post, postEl);
    }

    return data;
  } catch (e) {
    console.log(`post.confirmed ${post.confirmedReaction}  vs ${previousReaction}`)
    const confirmed = post.confirmedReaction ?? previousReaction;

    if ((post.liked ?? 0) !== confirmed) {
      synchronizeReactions(post.liked ?? 0, confirmed, post, postEl);
    }

  }

}
