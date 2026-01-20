import ERROR_CODES from "../constants/errorCodes.js";
import { AppError } from "../errors/AppError.js";
import { loginUser, registerUser } from "../service/auth.service.js";

export async function registerController(req, res, next) {
  try {
    await registerUser(req.body);
    res.status(201);
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const { userId, username } = await loginUser(req.body);

    req.session.regenerate((err) => {  //usunie id starej sesji przy nowym zalogowaniu
      if (err) {
        return next(
          new AppError(ERROR_CODES.SESSION_ERROR, 500)
        );
      }
      req.session.userId = userId;
      req.session.username = username;

      res.cookie('username', username, {
        maxAge: 24 * 60 * 60 * 1000,  //podaje sie w milisekundach (dla przeglądarki)
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
      });

      console.log("ppp")

      res.sendStatus(200);
    });

  } catch (err) {
    next(err);
  }
}


export function logoutController(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      return next(new AppError(ERROR_CODES.SESSION_ERROR, 500));
    }

    res.clearCookie("username", { path: "/" });
    res.clearCookie("meet-me-session", { path: "/" });
    return res.sendStatus(200);
  });
}


