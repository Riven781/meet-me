import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import mysql from 'mysql2';
import { loginUser, registerUser, createPost, getFeed, setReactionToPost, publishComment, getCommentsForPost, getRepliesForComment, addCommentLike, removeCommentLike, getUserByUsername, getPostsByUser, getPostByPostId, editPost } from './service/users.js';
import session from 'express-session';


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());



app.use("/avatars", express.static(path.join(__dirname, "../public/images/avatars")));
app.use(express.static(path.join(__dirname, '../public')));



app.use(session({
  name: 'meet-me-session',
  secret: 'secret',
  resave: false,  //nie zapisuj sesji, jesli nic sie nie zmienia
  saveUninitialized: false,  //sesja powstanie dopiero gdy cos sie zapisze
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,  //podaje sie w milisekundach (dla przeglądarki)
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ code: "UNAUTHORIZED" });
  }
  else {
    next();
  }
}


function requireAuthPage(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/start');
  }
  else {
    next();
  }
}
const protectedRouter = express.Router();
protectedRouter.use(requireAuthPage);

protectedRouter.get('/posts', (req, res) => {
  res.sendFile(path.join(__dirname, '../protected/posts.html'));
});

protectedRouter.get('/profile/:username', async (req, res) => {
  res.sendFile(path.join(__dirname, '../protected/profile.html'));
});

app.use('/meet-me', protectedRouter);

app.get('/start', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/start.html'));
})


app.post('/api/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    if (result.ok) {
      res.status(200).json(result);
    } else {
      const status = result.code === "USER_ALREADY_EXISTS" ? 409 : 400;

      res.status(status).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const result = await loginUser(req.body);
    if (result.ok) {
      req.session.regenerate((err) => {  //usunie id starej sesji przy nowym zalogowaniu
        if (err) {
          console.error(err);
          res.status(500).json({ code: "SESSION_ERROR" });
        }
        req.session.userId = result.userId;
        req.session.username = result.username;
        res.status(200).json({
          ok: true
        });
      });


    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
})

app.post('/api/createPost', requireAuth, async (req, res) => {
  try {
    const result = await createPost(req.session.userId, req.body.text);
    if (result.ok) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});

app.get("/api/getPosts", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const limit = Number(req.query.limit) || 20;

    let lastPostCursor = null;
    if (req.query.lastPostCursor) {
      lastPostCursor = decodeCursor(req.query.lastPostCursor);
    }
    console.log(` username: ${req.query.username}`);
    let posts;
    if (req.query.username) {

      posts = await getPostsByUser(userId, req.query.username, limit, lastPostCursor);
    }
    else {
      posts = await getFeed(userId, limit, lastPostCursor);
    }

    //console.log(` posts: ${posts.posts }`);
    //console.log(` posts.length: ${posts.posts.length }`);


    if (!posts.ok) {
      return res.status(404).json({ code: "POSTS_NOT_FOUND" });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});

app.post('/api/reaction', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { postId, reactionType } = req.body;
    const result = await setReactionToPost(userId, postId, reactionType);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});


app.post('/api/postComment', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { postId, content, parentId, replyToCommentId } = req.body;
    console.log(` parentId: ${parentId}`);
    const result = await publishComment(userId, postId, content, parentId, replyToCommentId);
    if (result.ok) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});

app.get('/api/getComments', requireAuth, async (req, res) => {
  try {
    const postId = Number(req.query.postId);
    const limit = Number(req.query.limit) || 20;
    let lastCommentCursor = null;
    if (req.query.lastCommentCursor) {
      lastCommentCursor = decodeCursor(req.query.lastCommentCursor);
    }
    if (req.query.parentId) {
      const parentId = Number(req.query.parentId);
      console.log(` parentId: ${parentId}`);
      const comments = await getRepliesForComment(parentId, limit, lastCommentCursor);
      console.log(` comments: ${JSON.stringify(comments)}`);
      res.status(200).json(comments);
      return;
    } else {
      const comments = await getCommentsForPost(postId, limit, lastCommentCursor);
      res.status(200).json(comments);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});


app.put("/api/comments/:commentId/like", requireAuth, async (req, res) => {
  try {
    console.log(`put`);
    const commentId = Number(req.params.commentId);
    const userId = req.session.userId;

    const result = await addCommentLike(userId, commentId);

    if (!result.ok) {
      return res.status(400).json(result);
    }
    else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});


app.delete("/api/comments/:commentId/like", requireAuth, async (req, res) => {
  try {
    console.log(`delete`);
    const commentId = Number(req.params.commentId);
    const userId = req.session.userId;
    const result = await removeCommentLike(userId, commentId);
    if (!result.ok) {
      return res.status(400).json(result);
    }
    else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})

app.get("/api/profile/:username", requireAuth, async (req, res) => {
  try {
    const username = req.params.username;
    const user = await getUserByUsername(username);
    if (!user.ok) {
      return res.status(404).json({ code: "USER_NOT_FOUND" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});


app.patch("/api/posts/:postId", requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const { content } = req.body;
    const userId = req.session.userId;
    const username = req.session.username;

    try{
      const post = await getPostByPostId(postId);
      if (post.authorName !== username) {
        return res.status(401).json({ code: "UNAUTHORIZED" });
      }
      if(!post.ok) {
        return res.status(404).json({ code: "POST_NOT_FOUND" });
      }
    } 
    catch (error) {
      console.error(error);
      return res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
    }
    

    const result = await editPost(postId, content);
    if (!result.ok) {
      return res.status(400).json(result);
    }

    const afterEditPost = await getPostByPostId(postId);

    if (!afterEditPost.ok) {
      return res.status(404).json({ code: "POST_NOT_FOUND" });
    }
    res.status(200).json(afterEditPost);

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
});



function decodeCursor(cursor) {
  const cursorStr = Buffer.from(cursor, 'base64').toString('utf8');
  return JSON.parse(cursorStr);
}