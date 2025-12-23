const LOGIN_STATUS = 0;
const REGISTER_STATUS = 1;

let wStatus = LOGIN_STATUS;

const registerOptionBtn = document.getElementById('register-option-btn');
const loginOptionBtn = document.getElementById('login-option-btn');



const loginElements = document.querySelectorAll('.login');
const registerElements = document.querySelectorAll('.register');

registerOptionBtn.addEventListener('click', () => {
  wStatus = REGISTER_STATUS;

  loginElements.forEach(el => el.classList.add('hide'));
  registerElements.forEach(el => el.classList.remove('hide'));

});

loginOptionBtn.addEventListener('click', () => {
  wStatus = LOGIN_STATUS;

  loginElements.forEach(el => el.classList.remove('hide'));
  registerElements.forEach(el => el.classList.add('hide'));
});


const userNameInput = document.getElementById('login-input');
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

let userNameOrEmail = '';
let password = '';
let email = '';
let firstName = '';
let lastName = '';
let username = '';

userNameInput.addEventListener('input', (e) => {
  userNameOrEmail = e.target.value;
});

userNameInput.addEventListener('focus', () => {
  userNameInput.style.padding = '0 5px 2px 5px';
  userNameInput.placeholder = '';
  loginLabel.style.display = 'inline';
});


userNameInput.addEventListener('blur', () => {
  userNameInput.placeholder = 'Username or email';
  
  if (userNameOrEmail === '') {
    loginLabel.style.display = 'none';
    userNameInput.style.padding = '5px';
    
  }
});

passwordInput.addEventListener('input', (e) => {
  password = e.target.value;
});

passwordInput.addEventListener('focus', () => {
  passwordInput.style.padding = '0 5px 2px 5px';
  passwordInput.placeholder = '';
  passwordLabel.style.display = 'inline';
});

passwordInput.addEventListener('blur', () => {
  passwordInput.placeholder = 'Password';
  if (password === '') {
    passwordLabel.style.display = 'none';
    passwordInput.style.padding = '5px';
  }
});

emailInput.addEventListener('input', (e) => {
  email = e.target.value;
});

emailInput.addEventListener('focus', () => {
  emailInput.style.padding = '0 5px 2px 5px';
  emailInput.placeholder = '';
  emailLabel.style.display = 'inline';
});

emailInput.addEventListener('blur', () => {
  emailInput.placeholder = 'Email';
  if (email === '') {
    emailLabel.style.display = 'none';
    emailInput.style.padding = '5px';
  }
});

firstNameInput.addEventListener('input', (e) => {
  firstName = e.target.value;
});

firstNameInput.addEventListener('focus', () => {
  firstNameInput.style.padding = '0 5px 2px 5px';
  firstNameInput.placeholder = '';
  firstNameLabel.style.display = 'inline';
});

firstNameInput.addEventListener('blur', () => {
  firstNameInput.placeholder = 'First name';
  if (firstName === '') {
    firstNameLabel.style.display = 'none';
    firstNameInput.style.padding = '5px';
  }
});


lastNameInput.addEventListener('input', (e) => {
  lastName = e.target.value;
});

lastNameInput.addEventListener('focus', () => {
  lastNameInput.style.padding = '0 5px 2px 5px';
  lastNameInput.placeholder = '';
  lastNameLabel.style.display = 'inline';
});

lastNameInput.addEventListener('blur', () => {
  lastNameInput.placeholder = 'Last name';
  if (lastName === '') {
    lastNameLabel.style.display = 'none';
    lastNameInput.style.padding = '5px';
  }
});

usernameInput.addEventListener('input', (e) => {
  username = e.target.value;
});

usernameInput.addEventListener('focus', () => {
  usernameInput.style.padding = '0 5px 2px 5px';
  usernameInput.placeholder = '';
  usernameLabel.style.display = 'inline';
});

usernameInput.addEventListener('blur', () => {
  usernameInput.placeholder = 'Username';
  if (username === '') {
    usernameLabel.style.display = 'none';
    usernameInput.style.padding = '5px';
  }
});


const specialEffect = document.querySelector('.special-effect');



