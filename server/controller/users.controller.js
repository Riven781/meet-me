import { getUserByUsername, saveImageUrl } from "../service/users.service.js";

export async function getProfileController(req, res, next) {
  try {
    const { username } = req.params;

    const data = await getUserByUsername(username);

    res.json(data);
  } catch (err) {
    next(err);
  }
}


export async function uploadAvatarController(req, res, next) {
  try {
    const userId = req.session.userId;

    if (!req.file) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 400, {
        errors: { image: "Image file is required" }
      });
    }

    const imageUrl = `/avatars/${req.file.filename}`;

    await saveImageUrl(userId, imageUrl, "avatar");

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}


export async function uploadBackgroundController(req, res, next) {
  try {
    const userId = req.session.userId;

    if (!req.file) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 400, {
        errors: { image: "Image file is required" }
      });
    }

    const imageUrl = `/backgrounds/${req.file.filename}`;

    await saveImageUrl(userId, imageUrl, "background");

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}