import { AppError } from "../errors/AppError.js";
import ERROR_CODES from "../constants/errorCodes.js";
import { findUserByUsername, saveAvatarImgUrl, saveBackgroundImgUrl } from "../repository/users.repository.js";
import { getProfileData } from "../utils/formatData.js";

export async function getUserByUsername(username) {
  const user = await findUserByUsername(username);

  if(!user){
    throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
  }

  return {
    user: getProfileData(user)
  }
}


export async function saveImageUrl(userId, imageUrl, imageType) {
  if (imageType === "avatar") {
    await saveAvatarImgUrl(userId, imageUrl);
  } else if (imageType === "background") {
    await saveBackgroundImgUrl(userId, imageUrl);
  } else {
    throw new AppError(ERROR_CODES.INVALID_IMAGE_TYPE, 400);
  }

  return {
    imageType,
    imageUrl
  };


}