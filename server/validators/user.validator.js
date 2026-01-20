export function validateUser(user) {
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