import { loginUser, logout, registerUser } from "../api/auth.api.js";
import { setLoginErrorMessage, setRegisterErrorMessage } from "../utils/formErrors.js";


export async function onLogout() {
  try {
    await logout();
    window.location.href = "/meet-me/start";
  } catch (e) {
    console.error(e);
  }
}


function clearInputs(...inputs) {
  for (const input of inputs) {
    if (input) input.value = "";
  }
}

export async function onLoginSubmit(inputs) {

  const { loginInput, passwordInput, emailInput, firstNameInput, lastNameInput, usernameInput } = inputs;

  const usernameOrEmail = loginInput.value.trim();
  const password = passwordInput.value;

  try {
    await loginUser(usernameOrEmail, password);

    clearInputs(loginInput, passwordInput, emailInput, firstNameInput, lastNameInput, usernameInput);

    window.location.href = "/meet-me/posts";
  } catch (err) {
    //console.error(err);
    if (err?.code === 'INVALID_CREDENTIALS') {
      setLoginErrorMessage();
    }
  }
}


export async function onRegisterSubmit(inputs, loginElements, registerElements) {

  const {
    usernameInput,
    emailInput,
    firstNameInput,
    lastNameInput,
    passwordInput,
    loginInput,
  } = inputs;

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const password = passwordInput.value;

  try {
    await registerUser({
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });


    loginElements?.forEach(el => el.classList.remove("hide"));
    registerElements?.forEach(el => el.classList.add("hide"));

    if (loginInput) loginInput.value = username;

    clearInputs(emailInput, firstNameInput, lastNameInput, usernameInput, passwordInput);

  } catch (err) {
    if (err?.code === 'VALIDATION_ERROR' || err?.code === 'USER_ALREADY_EXISTS') {
      setRegisterErrorMessage(err?.details?.errors);
    }
  }
}


