import { AppError } from "../errors/AppError.js";
import ERROR_CODES from "../constants/errorCodes.js";
import { validateUser } from "../validators/user.validator.js";
import { getDuplicateFieldFromSqlMessage } from "../utils/dbErrorUtils.js";
import { createUser, getUserByEmail, getUserByUsername  } from "../repository/users.repository.js";
import bcrypt from "bcrypt";



export async function loginUser(userData) {
  const { usernameOrEmail, password } = userData;
  
  const user = usernameOrEmail.includes('@') ? await getUserByEmail(usernameOrEmail) : await getUserByUsername(usernameOrEmail);

  if (!user) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  )

  if(!isPasswordValid){
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
  const hashedPassword = await bcrypt.hash(user.password, 12);

  try {
    await createUser({...user, password: hashedPassword});

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

