import { AppError } from "../errors/AppError.js";
import ERROR_CODES from "../constants/errorCodes.js";
import { validateUser } from "../validators/user.validator.js";
import { getDuplicateFieldFromSqlMessage } from "../utils/dbErrorUtils.js";
import { createUser, getUserByEmailAndPassword, getUserByUsernameAndPassword } from "../repository/users.repository.js";

export async function loginUser(userData) {
  const { usernameOrEmail, password } = userData;
  const user = usernameOrEmail.includes('@') ? await getUserByEmailAndPassword(usernameOrEmail, password) : await getUserByUsernameAndPassword(usernameOrEmail, password);

  if (!user) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
  }
  return {
    userId: user.id,
    username: user.username
  }
}

export async function registerUser(user) {
  const { errors, isValid } = validateUser(user);
  if (!isValid) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 400, {errors});
  }

  try {
    await createUser(user);

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const field = getDuplicateFieldFromSqlMessage(error.sqlMessage);
      
      throw new AppError(
        ERROR_CODES.USER_ALREADY_EXISTS, 409, {
          errors : 
            field ?
              {[field] : `User with this ${field} already exists`}
              :
              {general: "User already exists"}
        }
      )
    }
    throw error;
  }
}

