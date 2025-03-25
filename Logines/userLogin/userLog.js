// State management
let isLogin = true;
let currentUser = null;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const toggleAuth = document.getElementById('toggle-auth');
const toggleText = document.getElementById('toggle-text');
const forgotPassword = document.getElementById('forgot-password');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message'); // Success message element

// Additional form fields
const fullnameGroup = document.getElementById('fullname-group');
const emailGroup = document.getElementById('email-group');
const confirmPasswordGroup = document.getElementById('confirm-password-group');

// Form inputs
const usernameInput = document.getElementById('username');
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');

// Dashboard elements
const welcomeMessage = document.getElementById('welcome-message');
const uniqueCode = document.getElementById('unique-code');
const userEmail = document.getElementById('user-email');
const rankingElement = document.getElementById('ranking');
const eventsParticipated = document.getElementById('events-participated');
const eventsOrganized = document.getElementById('events-organized');
const eventsVolunteered = document.getElementById('events-volunteered');

// Utility Functions
function validatePassword(password) {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumberAndLetter = /^(?=.*[0-9])(?=.*[a-zA-Z])/.test(password);

  return hasMinLength && hasUpperCase && hasSpecialChar && hasNumberAndLetter;
}

function generateUniqueCode(fullName) {
  const nameLetters = fullName.substring(0, 2).toUpperCase();
  const randomLetters = Array.from({ length: 2 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  const randomNumbers = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ).join('');

  return `${nameLetters}${randomLetters}${randomNumbers}`;
}

// Password visibility toggle
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return; // Ensure the input field exists

  const button = input.closest('.input-group')?.querySelector('.toggle-password');
  if (!button) return; // Ensure the button exists

  const icon = button.querySelector('i');
  if (!icon) return; // Ensure the icon exists

  // Toggle password visibility
  if (input.type === 'password') {
    input.type = 'text';
    icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    icon.setAttribute('data-lucide', 'eye');
  }

  lucide.createIcons(); // Refresh icons
}

// UI Functions
function toggleAuthMode() {
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? 'Welcome Back' : 'Create Account';
  toggleAuth.textContent = isLogin ? 'Register' : 'Login';
  toggleText.textContent = isLogin ? "Don't have an account? " : "Already have an account? ";
  forgotPassword.style.display = isLogin ? 'block' : 'none';

  // Toggle additional fields
  fullnameGroup.classList.toggle('hidden', isLogin);
  emailGroup.classList.toggle('hidden', isLogin);
  confirmPasswordGroup.classList.toggle('hidden', isLogin);

  // Update required attributes
  fullnameInput.required = !isLogin;
  emailInput.required = !isLogin;
  confirmPasswordInput.required = !isLogin;

  // Clear form
  authForm.reset();
  errorMessage.textContent = '';
  successMessage.textContent = ''; // Clear success message
}

function showDashboard(user) {
  authContainer.classList.add('hidden');
  dashboard.classList.remove('hidden');

  if (user) {
    welcomeMessage.textContent = `Welcome, ${user.fullName}`;
    uniqueCode.textContent = `Unique Code: ${user.uniqueCode}`;
    userEmail.textContent = user.email || 'N/A';
    rankingElement.textContent = user.ranking ? `#${user.ranking}` : 'N/A';
    eventsParticipated.textContent = user.eventsParticipated || 0;
    eventsOrganized.textContent = user.eventsOrganized || 0;
    eventsVolunteered.textContent = user.eventsVolunteered || 0;
  }
}

// Backend API Calls
async function handleSubmit(event) {
  event.preventDefault();
  errorMessage.textContent = '';
  successMessage.textContent = ''; // Clear previous success messages

  if (isLogin) {
    // Login API Call
    const loginData = {
      fullName: usernameInput.value.trim(),
      password: passwordInput.value.trim()
    };
    try {
      const response = await fetch('http://localhost:8080/user/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      currentUser = data;
      successMessage.textContent = 'Login successful! Redirecting...'; // Success message
      setTimeout(() => showDashboard(currentUser), 2000); // Redirect after delay
    } catch (error) {
      errorMessage.textContent = error.message;
    }

  } else {
    // Registration API Call
    if (passwordInput.value !== confirmPasswordInput.value) {
      errorMessage.textContent = 'Passwords do not match';
      return;
    }

    if (!validatePassword(passwordInput.value)) {
      errorMessage.textContent = 'Password must contain at least 8 characters, 1 capital letter, 1 special character, and numbers';
      return;
    }

    const uniqueCodeGenerated = generateUniqueCode(fullnameInput.value.trim());

    const registerData = {
      username: usernameInput.value.trim(),
      fullName: fullnameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
      uniqueCode: uniqueCodeGenerated // Ensure the backend supports this field
    };

    try {
      const response = await fetch('http://localhost:8080/user/Register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      currentUser = data;
      successMessage.textContent = 'Registration successful! Redirecting...'; // Success message
      setTimeout(() => showDashboard(currentUser), 2000); // Redirect after delay
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  }
}

// Event Listeners
toggleAuth.addEventListener('click', (e) => {
  e.preventDefault();
  toggleAuthMode();
});

authForm.addEventListener('submit', handleSubmit);
