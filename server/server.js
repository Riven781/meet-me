import "dotenv/config";
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import session from 'express-session';
import multer from 'multer';
import { loginController, logoutController, registerController } from "./controller/auth.controller.js";
import { createPostController, deletePostController, editPostController, getPostsController, setReactionController } from "./controller/posts.controller.js";
import { addCommentLikeController, getCommentsController, publishCommentController, removeCommentLikeController } from "./controller/comments.controller.js";
import { getProfileController, uploadAvatarController, uploadBackgroundController } from "./controller/users.controller.js";
import { requireAuth, requireAuthPage } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`req.path: ${req.path}`);
    const pathStart = '/api/profile/upload';
  if (req.path === pathStart + '/avatar'){
    cb(null, path.join(__dirname, '../public/images/avatars'));
  }
  else if (req.path === pathStart + '/background'){
    cb(null, path.join(__dirname, '../public/images/backgrounds'));
  }
  else{
    cb(null, path.join(__dirname, '../public/images/unknown'));
  }
    //cb(null, path.join(__dirname, '../public/images/avatars'));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    console.log(`uniqueName: ${uniqueName}`);
    console.log(`file.originalname: ${file.originalname}`);
    cb(null, uniqueName);
  }
})

const upload = multer({ storage: storage });


app.use("/avatars", express.static(path.join(__dirname, "../public/images/avatars")));
app.use("/backgrounds", express.static(path.join(__dirname, "../public/images/backgrounds")));
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


app.post('/api/register', registerController);

app.post('/api/login', loginController);

app.post('/api/createPost', requireAuth, createPostController);

app.get("/api/getPosts", requireAuth, getPostsController);

app.post('/api/reaction', requireAuth, setReactionController);

app.get('/api/getComments', requireAuth, getCommentsController);

app.post('/api/postComment', requireAuth, publishCommentController);

app.put("/api/comments/:commentId/like", requireAuth, addCommentLikeController);

app.delete("/api/comments/:commentId/like", requireAuth, removeCommentLikeController);

app.get("/api/profile/:username", requireAuth, getProfileController);

app.patch("/api/posts/:postId", requireAuth, editPostController);


app.delete("/api/posts/:postId", requireAuth, deletePostController);

app.post("/api/logout", logoutController);

app.post('/api/profile/upload/avatar', requireAuth, upload.single('image'), uploadAvatarController);

app.post("/api/profile/upload/background", requireAuth, upload.single('image'), uploadBackgroundController);

app.use(errorHandler);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})

