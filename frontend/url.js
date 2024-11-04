// url.js
function loadConfig() {
    // console.log("Loading config"); // Debugging line
    window.config = {
      BACKEND_URL: "http://127.0.0.1:8001" // Your backend URL
    };
    // console.log("Loaded"); // Debugging line
    // console.log("Backend URL is:", window.config.BACKEND_URL); // Debugging line
  }
  
  // Call loadConfig immediately to ensure it's set up when other scripts run
  loadConfig();
  