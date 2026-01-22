export function setRegisterErrorMessage(errors) {
  console.log(errors);

  if (errors?.password) {
    const passwordInput = document.getElementById('password-input');
    const passwordField = passwordInput?.parentElement;
    const passwordErrorMsg = document.getElementById('password-error-msg');
    passwordField?.classList.add('error-field');
    passwordErrorMsg.textContent = errors.password;
  }
  if (errors?.email) {
    const emailInput = document.getElementById('email-input');
    const emailField = emailInput?.parentElement;
    const emailErrorMsg = document.getElementById('email-error-msg');
    emailField?.classList.add('error-field');
    emailErrorMsg.textContent = errors.email;
  }
  if (errors?.username) {
    const usernameInput = document.getElementById('username-input');
    const usernameField = usernameInput?.parentElement;
    const usernameErrorMsg = document.getElementById('username-error-msg');
    usernameField?.classList.add('error-field');
    usernameErrorMsg.textContent = errors.username;
  }
  if (errors?.first_name) {
    const firstNameInput = document.getElementById('first-name-input');
    const firstNameField = firstNameInput?.parentElement;
    const firstNameErrorMsg = document.getElementById('first-name-error-msg');
    firstNameField?.classList.add('error-field');
    firstNameErrorMsg.textContent = errors.first_name;
  }
  if (errors?.last_name) {
    const lastNameInput = document.getElementById('last-name-input');
    const lastNameField = lastNameInput?.parentElement;
    const lastNameErrorMsg = document.getElementById('last-name-error-msg');
    lastNameField?.classList.add('error-field');
    lastNameErrorMsg.textContent = errors.last_name;
  }


  if (errors?.general) {
    const generalErrorMsg = document.getElementById('general-error-msg');
    generalErrorMsg.textContent = errors.general;
  }

}



export function setLoginErrorMessage(){
  const generalErrorMsg = document.getElementById('general-error-msg');
  generalErrorMsg.textContent = "Invalid username/email or password";
}

export function setServerErrorForForms(){
  const generalErrorMsg = document.getElementById('general-error-msg');
  generalErrorMsg.textContent = "Problem with server. Try again later... 😅";
}
