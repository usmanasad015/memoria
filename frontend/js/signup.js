document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the default form submission
  // Show the loader
  document.getElementById('loader').style.display = 'flex';


  // Get form data
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const profile = document.getElementById('file-upload').files[0]; // Get the file
  console.log("profile: " + profile)

  // Clear any previous error messages
  const errorDiv = document.getElementById('error-message');
  errorDiv.innerHTML = ''; // Clear previous error messages

  // Helper function to display error messages
  function showError(message) {
    errorDiv.innerHTML += `<p style="color: red;">${message}</p>`;
  }

  // Email validation regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password validation regex patterns
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  // File validation (profile picture must be image file less than 2MB)
  const allowedFileTypes = ['image/jpeg', 'image/png'];
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  // Check if all fields are filled
  if (!username || !email || !password || !confirmPassword) {
    showError('All fields are required.');
    return;
  }

  // Validate email format
  if (!emailPattern.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  // Validate username (no special characters, at least 3 characters)
  if (username.length < 3 || /[^a-zA-Z0-9_]/.test(username)) {
    showError('Username must be at least 3 characters long and contain only letters, numbers, or underscores.');
    return;
  }

  // Validate password (at least 8 characters, with uppercase, lowercase, number, special character)
  if (!passwordPattern.test(password)) {
    showError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
    return;
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    showError('Passwords do not match!');
    return;
  }

  // Validate profile picture (optional)
  if (profile) {
    if (!allowedFileTypes.includes(profile.type)) {
      showError('Profile picture must be a JPG or PNG file.');
      return;
    }

    if (profile.size > maxFileSize) {
      showError('Profile picture must be less than 2MB.');
      return;
    }
  }

  // If all validations pass, proceed with form submission
  const formData = new FormData();
  formData.append('username', username);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('password2', confirmPassword);
  if (profile) formData.append('profile_picture', profile); // Append the file if present


  // Send POST request to API for signup
  fetch(`${window.config.BACKEND_URL}/api/register/`, {
    method: 'POST',
    body: formData,
  })
  .then(response => {
    // Hide the loader after response is received
    document.getElementById('loader').style.display = 'none';


      if (response.status === 201 || response.status === 200) {
          // After successful registration, send OTP to the email
          return fetch(`${window.config.BACKEND_URL}/api/forgot-password/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
          });
      } else {
          return response.json();  // If not 201, return the response as JSON
      }
  })
  .then(response => response.json())
  .then(data => {
     // Hide the loader after processing the response
     console.log("success", data)
     document.getElementById('loader').style.display = 'none';

    if (data.message === "OTP sent to your email.") {
      window.location.href = '../otp.html?email=' + encodeURIComponent(email);
    } else {
      // Handle server-side validation errors for all fields
      if (data.username) {
        showError('Username: ' + data.username.join(', '));
      }
      
      if (data.password) {
        showError('Password: ' + data.password.join(', '));
      }

      if (data.password2) {
        showError('Confirm Password: ' + data.password2.join(', '));
      }

      if (data.email) {
        showError('Email: ' + data.email.join(', '));
      }

      // Handle any additional errors
      if (!data.username && !data.password && !data.password2 && !data.email) {
        showError('Signup failed. Please try again.');
      }
    }
  })
  .catch(error => {
    document.getElementById('loader').style.display = 'none';
    showError('An error occurred. Please try again.');
  });
});
