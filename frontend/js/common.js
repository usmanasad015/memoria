function loadNavBar () {
    const dashboardLink = document.getElementById("dashboardLink");
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");
    const user_image = document.getElementById("user_image");

    // Function to check if the user is logged in
    function isLoggedIn() {
      const accessToken = sessionStorage.getItem("access_token");
      if (accessToken) {
        // Show the Dashboard and Logout link, hide Login link if the user is logged in
        dashboardLink.style.display = "block";
        loginLink.style.display = "none";
        logoutLink.style.display = "block";
        user_image.style.display = "block";
      } else {
        // Hide the Dashboard and Logout link, show Login link if the user is not logged in
        dashboardLink.style.display = "none";
        loginLink.style.display = "block";
        logoutLink.style.display = "none";
        user_image.style.display = "none";
      }
    }

    // Check login status on page load
    isLoggedIn();

    // Assuming the user's role is stored in session storage
    var userRole = sessionStorage.getItem("role");

    // Show or hide the dashboard link based on the user's role
    if (userRole === "partner") {
      dashboardLink.style.display = "block";
      dashboardLink.querySelector("a").href = "dashboard.html";
    } else if (userRole === "admin") {
      dashboardLink.style.display = "block";
      dashboardLink.querySelector("a").href = "admin.html";
    } else if (userRole === "user") {
      dashboardLink.querySelector("a").href = "user.html";
    } else {
      dashboardLink.style.display = "none";
    }

    // Logout functionality
    logoutLink.addEventListener("click", function () {
      sessionStorage.removeItem("access_token"); // Remove the access token
      sessionStorage.removeItem("role"); // Optionally remove the role
      isLoggedIn(); // Update the navbar to reflect the logged-out state
      window.location.href = "login.html"; // Redirect to the login page
    });

    // // Automatically pause and reset video when modal is hidden
    // var videoModal = document.getElementById("videoModal");
    // videoModal.addEventListener("hidden.bs.modal", function () {
    //   var video = document.getElementById("video");
    //   video.pause();
    //   video.currentTime = 0;
    // });

    // JavaScript to toggle the accordion image
    document.querySelectorAll(".accordion-button").forEach((button) => {
      button.addEventListener("click", function () {
        const plusIcon = this.querySelector(".icon-plus");
        const minusIcon = this.querySelector(".icon-minus");

        // Toggle the images
        if (plusIcon.style.display === "inline-block") {
          plusIcon.style.display = "none";
          minusIcon.style.display = "inline-block";
        } else {
          plusIcon.style.display = "inline-block";
          minusIcon.style.display = "none";
        }
      });
    });


  // Assuming user_id is saved in session or accessible through an endpoint
  const userId = sessionStorage.getItem('user_id'); // Replace with your session retrieval logic
  const accessToken = sessionStorage.getItem('access_token'); // Replace with your session retrieval logic

  if (userId) {
      // API endpoint to get user details, replace with your actual URL
      const apiUrl = `http://127.0.0.1:8001/api/users/${userId}/`;

      fetch(apiUrl, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              // If you are using tokens for authentication, include them here:
              'Authorization': 'Bearer ' + accessToken
          }
      })
      .then(response => response.json())
      .then(data => {
          if (data.profile_picture) {
              // Dynamically set the src of the image tag with profile picture URL
              document.getElementById('user_image').src = data.profile_picture;
          }
      })
      .catch(error => {
          console.error('Error fetching user data:', error);
      });
  } else {
      console.error('User ID not found in session.');
  }

    
}