 // Fetch data from API
 document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded");
  const container = document.querySelector('.deceased'); // Select the card container
//   const accessToken = sessionStorage.getItem("access_token"); // Get the access token from sessionStorage

  // Clear the container before appending new content
  container.innerHTML = '';

  // Fetch data from API with authentication
  fetch(`${window.config.BACKEND_URL}/api/deceased/?all=true`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${accessToken}` // Include the token in the Authorization header
      }
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
    console.log(data);
      // Loop through the data and create cards dynamically
      data.forEach(item => {
          const cardHTML = `
              <div class="col-12 col-sm-6 col-md-4 col-lg-3 mt-4">
                  <div class="card h-100" style="padding:6px;">
                      <div style="height:240px; overflow: hidden;">
                          <img class="card-img-top w-100 h-100" src="${item.headshot}" style="object-fit: cover;" />
                      </div>
                      <div class="card-body d-flex flex-column">
                          <div class="d-flex justify-content-between">
                              <h6 class="card-title">${item.name}</h6>
                              <h6><img src="static/icons/location-04.svg" alt="Location" /> Location</h6>
                          </div>
                          <p class="card-text flex-grow-1 about-text" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${item.about}</p>
                          <button type="button" class="btn btn-sm mt-auto dearest_search_btn" data-id="${item.id}">
                              <b>Learn More</b>
                          </button>
                      </div>
                  </div>
              </div>
          `;
          // Append the new card to the container
          container.innerHTML += cardHTML;
      });

      // Limit the about text to two lines
    //   const aboutTexts = document.querySelectorAll('.about-text');
    //   aboutTexts.forEach(text => {
    //       const originalText = text.innerText;
    //       const lineHeight = parseInt(getComputedStyle(text).lineHeight);
    //       const maxHeight = lineHeight * 2; // 2 lines

    //       text.innerText = originalText;

    //       if (text.scrollHeight > maxHeight) {
    //           while (text.scrollHeight > maxHeight) {
    //               const words = text.innerText.split(' ');
    //               words.pop(); // Remove the last word
    //               text.innerText = words.join(' ') + '...'; // Add ellipsis
    //           }
    //       }
    //   });

      // Add click event listener to each 'Learn More' button
      const learnMoreButtons = document.querySelectorAll('.dearest_search_btn');
      learnMoreButtons.forEach(button => {
          button.addEventListener('click', function () {
              const id = this.getAttribute('data-id'); // Get the ID of the deceased
              // Redirect to the sample page and pass the ID
              window.location.href = `./single_sample.html?id=${id}`;
          });
      });
  })
  .catch(error => {
      console.error('Error fetching data:', error);
  });
});