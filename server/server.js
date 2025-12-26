import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import mysql from 'mysql2';
import { loginUser, registerUser } from './service/users.js';
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

function requireAuth(req, res, next){
  if (!req.session.userId){
    return res.status(401).json({ code: "UNAUTHORIZED" });
  }
  else {
    next();
  }
}


function requireAuthPage(req, res, next){
  if (!req.session.userId){
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

protectedRouter.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../protected/profile.html'));
});

app.use('/meet-me', protectedRouter);

app.get('/start', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/start.html'));
})


app.post('/api/register', async (req, res) => {
  try{
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
  try{
    const result = await loginUser(req.body);
    if (result.ok) {
      req.session.userId = result.userId;
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
  }
})


app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})

