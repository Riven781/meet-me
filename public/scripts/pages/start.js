import { onLoginSubmit, onRegisterSubmit } from "../controller/auth.controller.js";




const registerOptionBtn = document.getElementById('register-option-btn');
const loginOptionBtn = document.getElementById('login-option-btn');

const generalErrorMsg = document.getElementById('general-error-msg');

const loginElements = document.querySelectorAll('.login');
const registerElements = document.querySelectorAll('.register');

registerOptionBtn.addEventListener('click', () => {

  loginElements.forEach(el => el.classList.add('hide'));
  registerElements.forEach(el => el.classList.remove('hide'));
  if (generalErrorMsg) generalErrorMsg.textContent = '';

});

loginOptionBtn.addEventListener('click', () => {

  loginElements.forEach(el => el.classList.remove('hide'));
  registerElements.forEach(el => el.classList.add('hide'));
  if (generalErrorMsg) generalErrorMsg.textContent = '';
});


const loginInput = document.getElementById('login-input');
const loginLabel = document.getElementById('login-label');

const passwordInput = document.getElementById('password-input');
const passwordLabel = document.getElementById('password-label');

const emailInput = document.getElementById('email-input');
const emailLabel = document.getElementById('email-label');

const firstNameInput = document.getElementById('first-name-input');
const firstNameLabel = document.getElementById('first-name-label');

const lastNameInput = document.getElementById('last-name-input');
const lastNameLabel = document.getElementById('last-name-label');

const usernameInput = document.getElementById('username-input');
const usernameLabel = document.getElementById('username-label');

window.addEventListener('load', () => {
  const fields = document.querySelectorAll('.field');
  fields.forEach(field => {
    if (field.children[1].value !== '') {
      field.children[1].style.padding = '0 5px 2px 5px';
      field.children[1].placeholder = '';
      field.children[0].style.display = 'inline';
    }

  });
});

loginInput.addEventListener('focus', () => {
  loginInput.style.padding = '0 5px 2px 5px';
  loginInput.placeholder = '';
  loginLabel.style.display = 'inline';
});


loginInput.addEventListener('blur', () => {
  loginInput.placeholder = 'Username or email';
  
  if (loginInput.value === '') {
    loginLabel.style.display = 'none';
    loginInput.style.padding = '5px';
    
  }
});



passwordInput.addEventListener('focus', () => {
  passwordInput.style.padding = '0 5px 2px 5px';
  passwordInput.placeholder = '';
  passwordLabel.style.display = 'inline';
});

passwordInput.addEventListener('blur', () => {
  passwordInput.placeholder = 'Password';
  if (passwordInput.value === '') {
    passwordLabel.style.display = 'none';
    passwordInput.style.padding = '5px';
  }
});



emailInput.addEventListener('focus', () => {
  emailInput.style.padding = '0 5px 2px 5px';
  emailInput.placeholder = '';
  emailLabel.style.display = 'inline';
});

emailInput.addEventListener('blur', () => {
  emailInput.placeholder = 'Email';
  if (emailInput.value === '') {
    emailLabel.style.display = 'none';
    emailInput.style.padding = '5px';
  }
});



firstNameInput.addEventListener('focus', () => {
  firstNameInput.style.padding = '0 5px 2px 5px';
  firstNameInput.placeholder = '';
  firstNameLabel.style.display = 'inline';
});

firstNameInput.addEventListener('blur', () => {
  firstNameInput.placeholder = 'First name';
  if (firstNameInput.value === '') {
    firstNameLabel.style.display = 'none';
    firstNameInput.style.padding = '5px';
  }
});




lastNameInput.addEventListener('focus', () => {
  lastNameInput.style.padding = '0 5px 2px 5px';
  lastNameInput.placeholder = '';
  lastNameLabel.style.display = 'inline';
});

lastNameInput.addEventListener('blur', () => {
  lastNameInput.placeholder = 'Last name';
  if (lastNameInput.value === '') {
    lastNameLabel.style.display = 'none';
    lastNameInput.style.padding = '5px';
  }
});



usernameInput.addEventListener('focus', () => {
  usernameInput.style.padding = '0 5px 2px 5px';
  usernameInput.placeholder = '';
  usernameLabel.style.display = 'inline';
});

usernameInput.addEventListener('blur', () => {
  usernameInput.placeholder = 'Username';
  if (usernameInput.value === '') {
    usernameLabel.style.display = 'none';
    usernameInput.style.padding = '5px';
  }
});






const inputs = {
  loginInput,
  passwordInput,
  emailInput,
  firstNameInput,
  lastNameInput,
  usernameInput
}




const registerButton = document.getElementById('register-btn');
registerButton.addEventListener('click', (e) => {
  e.preventDefault();
  onRegisterSubmit( inputs, loginElements, registerElements);
});

const loginButton = document.getElementById('login-btn');
loginButton.addEventListener('click', (e) => {
  e.preventDefault();
  onLoginSubmit( inputs);
});




usernameInput.addEventListener('input', () => {
  const field = usernameInput.parentElement;
  field?.classList.remove('error-field');
  const errorMsg = document.getElementById('username-error-msg');
  if (errorMsg) errorMsg.textContent = '';
  if (generalErrorMsg) generalErrorMsg.textContent = '';
})

passwordInput.addEventListener('input', () => {
  const field = passwordInput.parentElement;
  field?.classList.remove('error-field');
  const errorMsg = document.getElementById('password-error-msg');
  if (errorMsg) errorMsg.textContent = '';
  if (generalErrorMsg) generalErrorMsg.textContent = '';
})

emailInput.addEventListener('input', () => {
  const field = emailInput.parentElement;
  field?.classList.remove('error-field');
  const errorMsg = document.getElementById('email-error-msg');
  if (errorMsg) errorMsg.textContent = '';
  if (generalErrorMsg) generalErrorMsg.textContent = '';
})

firstNameInput.addEventListener('input', () => {
  const field = firstNameInput.parentElement;
  field?.classList.remove('error-field');
  const errorMsg = document.getElementById('first-name-error-msg');
  if (errorMsg) errorMsg.textContent = '';
  if (generalErrorMsg) generalErrorMsg.textContent = '';
})

lastNameInput.addEventListener('input', () => {
  const field = lastNameInput.parentElement;
  field?.classList.remove('error-field');
  const errorMsg = document.getElementById('last-name-error-msg');
  if (errorMsg) errorMsg.textContent = '';
  if (generalErrorMsg) generalErrorMsg.textContent = '';
})

loginInput.addEventListener('input', () => {
  if (generalErrorMsg) generalErrorMsg.textContent = '';
})