import { createUser, getUserByEmailAndPassword, getUserByUsernameAndPassword} from '../repository/users.js'

export async function registerUser(user) {
  const { errors, isValid } = validateUser(user);
  if (!isValid) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      errors
    };
  }

  try {
    const userId = await createUser(user);
    return {
      ok: true,
      userId
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const message = error.sqlMessage;
      const field = message.includes('username') ? 'username' : message.includes('email') ? 'email' : 'unknown';
      return {
        ok: false,
        code: 'USER_ALREADY_EXISTS',
        errors: field !== 'unknown'
          ? { [field]: `User with this ${field} already exists` }
          : { [field]: "User already exists" }
      }
    }
    throw error;
  }
}

export async function loginUser(userData) {
  const { usernameOrEmail, password } = userData;
  try {
    let user;
    if (usernameOrEmail.includes('@')) {
      user = await getUserByEmailAndPassword(usernameOrEmail, password);
    } else {
      user = await getUserByUsernameAndPassword(usernameOrEmail, password);
    }
    if (!user){
      return {
        ok: false,
        code: "USER_NOT_FOUND",
        errors: {
          usernameOrEmail: "User not found"
        }
      }
    } else{
      return {
        ok: true,
        userId: user.id
      }
    }
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      code: "USER_NOT_FOUND --",
      errors: {
        usernameOrEmail: "User not found"
      }
    }
  }
}







function validateUser(user) {
  const errors = {}
  const { username, email, password, first_name, last_name } = user;

  if (username.includes(' ')) {
    errors.username = 'Username cannot contain spaces';
  }
  else if (username.length < 3 || username.length > 50) {
    errors.username = 'Username must be between 3 and 50 characters long';
  }

  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (first_name.length > 50) {
    errors.first_name = 'First name cannot be longer than 50 characters';
  }

  if (last_name.length > 50) {
    errors.last_name = 'Last name cannot be longer than 50 characters';
  }



  if (!email.includes('@') || !email.includes('.')) {
    errors.email = 'Email is not valid';
  } else if (email.length > 200) {
    errors.email = 'Email cannot be longer than 200 characters';
  }


  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };

}