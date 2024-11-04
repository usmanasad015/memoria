document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.querySelector(".login_button");

  loginButton.addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById("exampleInputEmail1").value;
    const password = document.getElementById("exampleInputPassword1").value;

    // Email validation using regex
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Send login request
    fetch(`${window.config.BACKEND_URL}/api/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Login failed. Please check your credentials.");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        // Store the access token, refresh token, and role in session storage
        sessionStorage.setItem("access_token", data.access);
        sessionStorage.setItem("refresh_token", data.refresh);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("user_id", data.id);

        // Optionally redirect the user after successful login
        window.location.href = "../index.html";
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
      });
  });

  // Check if the user is already logged in
  function isLoggedIn() {
    const accessToken = sessionStorage.getItem("access_token");
    if (accessToken) {
      console.log("User is already logged in");
      window.location.href = "/index.html"; // Redirect if logged in
    }
  }

  // Check login status on page load
  isLoggedIn();
});
