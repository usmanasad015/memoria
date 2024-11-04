
    
    document.addEventListener('DOMContentLoaded', function () {
        const token = sessionStorage.getItem('access_token');
        const role = sessionStorage.getItem('role');
    
        if (!token || role !== 'user') {
            // Redirect to login page if the user is not an admin or not logged in
            window.location.href = '/index.html';
        }
    });
    
    document.getElementById('signupForm').addEventListener('submit', async function(event) {
        event.preventDefault();
    
        const accessToken = sessionStorage.getItem("access_token");
        if (!accessToken) {
            document.getElementById('error-message').textContent = 'Access token is missing. Please log in again.';
            return;
        }
    
        const formData = new FormData();
    
        // Append deceased person details
        formData.append('name', document.getElementById('firstName').value);
        formData.append('date_of_birth', formatDate('birth'));
        formData.append('date_of_death', formatDate('death'));
        formData.append('date_of_burial', formatDate('burial'));
        formData.append('relationship_with_deceased', document.getElementById('relation').value);
    
        const headshot = document.getElementById('file-upload').files[0];
        if (headshot) formData.append('headshot', headshot);
    
        formData.append('about', document.getElementById('about').value);
        formData.append('quote', document.getElementById('quote').value);
    
        try {
            // Submit deceased data
            const deceasedResponse = await fetch(`${window.config.BACKEND_URL}/api/deceased/add/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` },
                body: formData
            });
    
            const deceasedResult = await deceasedResponse.json();
    
            if (deceasedResponse.ok) {
                const deceasedId = deceasedResult.id;
                
                // Prepare timeline data
                const timelineFormData = new FormData();
                timelineFormData.append('deceased', deceasedId);
    
                const eventNames = document.getElementsByName('event-name[]');
                const eventDates = document.getElementsByName('event-date[]');
                const briefDescriptions = document.getElementsByName('brief-description[]');
                const images = [
                    document.getElementsByName('image1[]'),
                    document.getElementsByName('image2[]'),
                    document.getElementsByName('image3[]')
                ];
    
                for (let i = 0; i < eventNames.length; i++) {
                    if (eventNames[i].value && eventDates[i].value && briefDescriptions[i].value) {
                        timelineFormData.append(`event_name[${i}]`, eventNames[i].value);
                        timelineFormData.append(`year[${i}]`, eventDates[i].value);
                        timelineFormData.append(`details[${i}]`, briefDescriptions[i].value);
    
                        for (let j = 0; j < 3; j++) {
                            const image = images[j][i].files[0];
                            if (image) {
                                timelineFormData.append(`image${j + 1}[${i}]`, image);
                            }
                        }
                    }
                }
    
                // Submit timeline data
                const timelineResponse = await fetch(`${window.config.BACKEND_URL}/api/timeline/`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    body: timelineFormData
                });
    
                if (timelineResponse.ok) {
                    // Now handle family album images upload
                    const familyAlbumInput = document.getElementById('family_album'); // Assuming this is your family album input
                    const familyAlbumFormData = new FormData();
                    familyAlbumFormData.append('deceased', deceasedId);
                    
                    for (const file of familyAlbumInput.files) {
                        familyAlbumFormData.append('image[]', file); // Assuming your API accepts 'images[]' for multiple files
                    }
    
                    const familyAlbumResponse = await fetch(`${window.config.BACKEND_URL}/api/family-album/`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                        body: familyAlbumFormData
                    });
    
                    if (familyAlbumResponse.ok) {
                        alert('Form submitted successfully!');
                        document.getElementById('signupForm').reset();
                    } else {
                        const familyAlbumResult = await familyAlbumResponse.json();
                        document.getElementById('error-message').textContent = familyAlbumResult.error || 'An error occurred while saving family album data';
                    }
                } else {
                    const timelineResult = await timelineResponse.json();
                    document.getElementById('error-message').textContent = timelineResult.error || 'An error occurred while saving timeline data';
                }
            } else {
                document.getElementById('error-message').textContent = deceasedResult.error || 'An error occurred while saving deceased data';
            }
        } catch (error) {
            document.getElementById('error-message').textContent = 'Network error occurred. Please try again.';
        }
    });
    
    
    function formatDate(prefix) {
        const month = document.getElementById(`${prefix}Month`).value;
        const date = document.getElementById(`${prefix}Date`).value;
        const year = document.getElementById(`${prefix}Year`).value;
        return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    }
    
      // view deceased
      const accessToken = sessionStorage.getItem("access_token"); // Replace with your actual access token

      async function loadDeceasedRecords() {
          try {
              const response = await fetch(`${window.config.BACKEND_URL}/api/deceased/?all=True`, {
                  headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json'
                  }
              });
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              const deceasedRecords = await response.json();
  
              const tbody = document.querySelector('#deceased-table tbody');
              tbody.innerHTML = ''; // Clear existing rows
  
              deceasedRecords.forEach(deceased => {
                  const row = document.createElement('tr');
  
                  row.innerHTML = `
                      <td>${deceased.name}</td>
                      <td>${deceased.date_of_birth}</td>
                      <td>${deceased.date_of_death}</td>
                      <td><img src="${deceased.headshot}"/ height="100"></td>
                      <td>
                          <button class="edit-btn btn btn-primary" onclick="editRecord(${deceased.id})">Edit</button>
                          <button class="delete-btn btn btn-danger" onclick="deleteRecord(${deceased.id})">Delete</button>
                      </td>
                  `;
  
                  tbody.appendChild(row);
              });
          } catch (error) {
              console.error('Error fetching deceased records:', error);
          }
      }
  
      async function deleteRecord(id) {
          if (confirm(`Are you sure you want to delete the record with ID: ${id}?`)) {
              try {
                  const response = await fetch(`${window.config.BACKEND_URL}/api/deceased/${id}/`, {
                      method: 'DELETE',
                      headers: {
                          'Authorization': `Bearer ${accessToken}`,
                          'Content-Type': 'application/json'
                      }
                  });
                  if (response.ok) {
                      alert('Record deleted successfully');
                      loadDeceasedRecords(); // Reload table after deletion
                  } else {
                      alert('Error deleting record');
                  }
              } catch (error) {
                  console.error('Error deleting record:', error);
              }
          }
      }
      
      document.addEventListener('DOMContentLoaded', () => {
        populateDropdowns();
    });
    

    document.addEventListener('DOMContentLoaded', () => {
        populateDropdowns();
    
        // Add event listener to the form submit
        document.getElementById('deceasedEdit').addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the default form submission
    
            await updateRecord();
        });
    });
    
    async function populateDropdowns() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const years = Array.from({ length: 124 }, (_, i) => new Date().getFullYear() - i);
    
        // Populate months dropdowns
        ['editbirthMonth', 'editdeathMonth', 'editburialMonth'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                months.forEach((month, index) => {
                    const option = document.createElement('option');
                    option.value = index + 1; // Months are 1-based
                    option.textContent = month;
                    select.appendChild(option);
                });
            } else {
                console.warn(`Element with ID ${id} not found.`);
            }
        });
    
        // Populate date dropdowns
        ['editbirthDate', 'editdeathDate', 'editburialDate'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                days.forEach(day => {
                    const option = document.createElement('option');
                    option.value = day;
                    option.textContent = day;
                    select.appendChild(option);
                });
            } else {
                console.warn(`Element with ID ${id} not found.`);
            }
        });
    
        // Populate year dropdowns
        ['editbirthYear', 'editdeathYear', 'editburialYear'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    select.appendChild(option);
                });
            } else {
                console.warn(`Element with ID ${id} not found.`);
            }
        });
    }
    
    async function editRecord(id) {
        const accessToken = sessionStorage.getItem('access_token');
    
        try {
            // Fetch the deceased record
            const response = await fetch(`${window.config.BACKEND_URL}/api/deceased/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const deceased = await response.json();
            console.log(deceased)
    
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('editModal'));
            modal.show();
    
            // Populate the form fields with deceased information
            document.querySelector('#editbirthMonth').value = new Date(deceased.date_of_birth).getMonth() + 1 || '';
            document.querySelector('#editbirthDate').value = new Date(deceased.date_of_birth).getDate() || '';
            document.querySelector('#editbirthYear').value = new Date(deceased.date_of_birth).getFullYear() || '';
    
            document.querySelector('#editdeathMonth').value = new Date(deceased.date_of_death).getMonth() + 1 || '';
            document.querySelector('#editdeathDate').value = new Date(deceased.date_of_death).getDate() || '';
            document.querySelector('#editdeathYear').value = new Date(deceased.date_of_death).getFullYear() || '';
    
            document.querySelector('#editburialMonth').value = new Date(deceased.date_of_burial).getMonth() + 1 || '';
            document.querySelector('#editburialDate').value = new Date(deceased.date_of_burial).getDate() || '';
            document.querySelector('#editburialYear').value = new Date(deceased.date_of_burial).getFullYear() || '';
    
            document.querySelector('#editName').value = deceased.name || '';
            document.querySelector('#editRelationship').value = deceased.relationship_with_deceased || '';
            document.querySelector('#editQuote').value = deceased.quote || '';
            document.querySelector('#editAbout').value = deceased.about || '';
    
            const headshotElem = document.querySelector('#editHeadshot');
            if (headshotElem) headshotElem.src = deceased.headshot || '';
    
            // Store the ID for update
            document.querySelector('#editModal').dataset.deceasedId = id;
    
            // Fetch the timeline data
            const timelineResponse = await fetch(`${window.config.BACKEND_URL}/api/details/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!timelineResponse.ok) {
                throw new Error(`HTTP error! Status: ${timelineResponse.status}`);
            }
    
            const timelineEvents = await timelineResponse.json();
            console.log(timelineEvents)
    
            // Populate the timeline details in the form
            const timelineContainer = document.querySelector('#form-container1');
            timelineContainer.innerHTML = ''; // Clear existing content
    
            timelineEvents.forEach((event, index) => {
                addTimelineEvent(timelineContainer, event, index);
            });
    
            // Add event listener for "Add More" button
            document.getElementById('add-more-1').addEventListener('click', () => {
                addTimelineEvent(timelineContainer);
            });
    
        } catch (error) {
            console.error('Error fetching deceased record:', error);
        }
    }
    
    // Function to add a timeline event
    function addTimelineEvent(container, event = {}, index = -1) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'form-set mb-4';
        eventDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="event-name" class="form-label">Event Name*</label>
                    <input
                        type="text"
                        class="form-control"
                        name="editevent-name[]"
                        value="${event.event_name || ''}"
                        placeholder="Enter event name"
                        required
                    />
                </div>
                <div class="col-md-6 mb-3">
                    <label for="event-date" class="form-label">Event Date*</label>
                    <input
                        type="text"
                        class="form-control"
                        name="editevent-date[]"
                        value="${event.year || ''}"
                        required
                    />
                </div>
            </div>
            <div class="row mb-3">
                 ${['image1', 'image2', 'image3'].map((img, imgIndex) => `
        <div class="col-md-4 mb-3">
            <label class="form-label">Upload ${imgIndex + 1}*</label>
            <div class="upload-box" onclick="document.getElementById('${img}-${index}').click();">
                <div class="text-center">
                    <span class="text-primary">Add photo</span>
                    <input
                        type="file"
                        id="${img}-${index}"
                        name="edit${img}[]"
                        accept="image/*"
                        style="display: none"
                        onchange="handleFileUpload(this)"
                    />
                </div>
            </div>
            ${event[img] ? `<img src="${event[img]}" id="preview-${img}-${index}" data-existing-url="${event[img]}" alt="Preview" style="max-width: 100%; height: auto;">` : ''}
        </div>
    `).join('')}
            </div>
            <div class="mb-3">
                <label for="brief-description" class="form-label">Brief Description*</label>
                <textarea
                    class="form-control"
                    name="editbrief-description[]"
                    rows="3"
                    placeholder="Write from here..."
                    required
                >${event.details || ''}</textarea>
            </div>
        `;
        container.appendChild(eventDiv);
    }
    
    
    async function updateRecord() {
        const accessToken = sessionStorage.getItem('access_token');
    const modal = document.getElementById('editModal');
    const id = modal.dataset.deceasedId;

    const formData = new FormData();
    
        
        
        // Gather form fields for deceased details
        formData.append('date_of_birth', `${document.querySelector('#editbirthYear').value}-${document.querySelector('#editbirthMonth').value.padStart(2, '0')}-${document.querySelector('#editbirthDate').value.padStart(2, '0')}`);
        formData.append('date_of_death', `${document.querySelector('#editdeathYear').value}-${document.querySelector('#editdeathMonth').value.padStart(2, '0')}-${document.querySelector('#editdeathDate').value.padStart(2, '0')}`);
        formData.append('date_of_burial', `${document.querySelector('#editburialYear').value}-${document.querySelector('#editburialMonth').value.padStart(2, '0')}-${document.querySelector('#editburialDate').value.padStart(2, '0')}`);
        formData.append('name', document.querySelector('#editName').value);
        formData.append('relationship_with_deceased', document.querySelector('#editRelationship').value);
        formData.append('quote', document.querySelector('#editQuote').value);
        formData.append('about', document.querySelector('#editAbout').value);
    
        // Handle headshot image
        const headshot = document.querySelector('#editHeadshot').files[0];
        if (headshot) {
            formData.append('headshot', headshot);
        }
    
        // Handle timelines
        const timelines = [];
        const eventNames = document.getElementsByName('editevent-name[]');
        const eventDates = document.getElementsByName('editevent-date[]');
        const briefDescriptions = document.getElementsByName('editbrief-description[]');
        const images = [
            document.getElementsByName('editimage1[]'),
            document.getElementsByName('editimage2[]'),
            document.getElementsByName('editimage3[]')
        ];
    
        for (let i = 0; i < eventNames.length; i++) {
            if (eventNames[i].value && eventDates[i].value && briefDescriptions[i].value) {
                const timelineItem = {
                    event_name: eventNames[i].value,
                    year: eventDates[i].value,
                    details: briefDescriptions[i].value
                };
    
                // Add the timeline ID if it exists (for updating existing timelines)
                const timelineId = document.querySelector(`#timeline-${i}`)?.dataset.timelineId;
                if (timelineId) {
                    timelineItem.id = timelineId;
                }
    
                for (let j = 0; j < 3; j++) {
                    const imageInput = images[j][i];
                    const imageFile = imageInput.files[0];
                    const imageKey = `image${j + 1}`;
                    const existingImagePreview = document.querySelector(`#preview-image${j + 1}-${i}`);
    
                    if (imageFile) {
                        // If user uploaded a new image, append the new one
                        formData.append(`timelines[${i}][${imageKey}]`, imageFile);
                        timelineItem[imageKey] = 'new_file';  // Placeholder to indicate a new file is being uploaded
                    } else if (existingImagePreview && existingImagePreview.dataset.existingUrl) {
                        // Use the existing image URL as the fallback
                        timelineItem[imageKey] = 'keep_existing';  // New placeholder to indicate keeping the existing file
                    } else {
                        timelineItem[imageKey] = null;
                    }
                }
    
                timelines.push(timelineItem);
            }
        }
    
    formData.append('timelines', JSON.stringify(timelines));

    try {
        const response = await fetch(`${window.config.BACKEND_URL}/api/deceased/${id}/update/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
        loadDeceasedRecords();
    } catch (error) {
        console.error('Error updating record:', error);
        alert('Failed to update the record.');
    }

    }
    
          
      document.addEventListener('DOMContentLoaded', loadDeceasedRecords);
      document.getElementById("view_deceased").addEventListener("click", loadDeceasedRecords)



      // update profile
      // Function to fetch user details and populate the form

// Prepopulate the form with the current user data (from the previous step)
async function populateForm() {
    const userId = sessionStorage.getItem('user_id');
    const access_token = sessionStorage.getItem('access_token');

    if (!userId) {
        console.error('User ID not found in session storage.');
        return;
    }

    try {
        const response = await fetch(`${window.config.BACKEND_URL}/api/users/${userId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`

            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const userData = await response.json();
        console.log(userData)

        document.getElementById('username').value = userData.username || '';

    document.getElementById("contact_no").value = userData.contact_number || ''
    document.getElementById("address").value = userData.address || ''
        // Note: Handle image prepopulation separately, as files can't be directly set in input
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}
// Handle form submission for updating the user profile
document.getElementById('updateprofileuser').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    const accessToken = sessionStorage.getItem('access_token');
    const userId = sessionStorage.getItem('user_id'); // Fetch user_id from session

    if (!userId) {
        console.error('User ID not found in session storage.');
        return;
    }

    // Collect form data
    const username = document.getElementById('username').value;
    const oldPassword = document.getElementById('old_password').value;  // Old password field
    const newPassword = document.getElementById('new_password').value;  // New password field
    const confirmPassword = document.getElementById('confirm_password').value; // Confirm password
    console.log("confirmPassword: " + newPassword + " " + oldPassword)
    const imageInput = document.getElementById('image'); // File input for profile image
    const contact_no = document.getElementById("contact_no").value;
    const address = document.getElementById("address").value;

    // Create a FormData object for file upload and form submission
    const formData = new FormData();
    formData.append('username', username);
    formData.append('contact_number', contact_no);
    formData.append('address', address);

    // Only append the new password if it matches the confirm password field
    if (newPassword && newPassword === confirmPassword) {
        formData.append('password', newPassword);
    } else if (newPassword) {
        alert("Passwords don't match.");
        return;
    }

    // Append profile image if it's updated
    if (imageInput.files.length > 0) {
        formData.append('profile_picture', imageInput.files[0]);
    }

    try {
        // Make the API request to update user data
        const response = await fetch(`${window.config.BACKEND_URL}/api/users/${userId}/`, {
            method: 'PUT',  // Use 'PATCH' to update specific fields if desired
            body: formData,
            headers: {
                'Authorization': `Bearer ${accessToken}`  // Include token for authentication
            }
        });

        if (response.ok) {
            alert('Profile updated successfully!');

            // If password was changed, log the user out for security reasons
            if (newPassword) {
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');
                sessionStorage.removeItem('user_id');
                sessionStorage.removeItem('role');

                alert('Password updated. You have been logged out for security reasons.');

                // Redirect to login page after clearing session storage
                window.location.href = '/login.html'; // Update with your actual login page URL
            }
        } else {
            const errorData = await response.json();
            alert(`Error updating profile: ${errorData.message || 'Unknown error occurred'}`);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating the profile.');
    }
});



document.getElementById("deleteAccount").addEventListener("click", async function removeUser() {
    const user_id = sessionStorage.getItem("user_id");
    if (confirm(`Are you sure you want to remove Your account`)) {
        try {
            const response = await fetch(`${window.config.BACKEND_URL}/api/users/${user_id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');
                sessionStorage.removeItem('user_id');
                sessionStorage.removeItem('role');

                alert('Your account has been deleted.');

                // Redirect to login page after clearing session storage
                window.location.href = '/login.html'; // Update with your actual login page URL
            } else {
                alert('Error removing user');
            }
        } catch (error) {
            console.error('Error removing user:', error);
        }
    }
});


// Call the populateForm function when the DOM is ready
document.addEventListener('DOMContentLoaded', populateForm);


// ****************************************************8888 Reviews ****************************************************************
// Function to fetch and populate the table
async function fetchUserName(userId) {
    const accessToken = sessionStorage.getItem('access_token');
    const response = await fetch(`${window.config.BACKEND_URL}/api/users/${userId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user with ID ${userId}`);
    }
  
    const userData = await response.json();
    return userData.username; // Assuming the API returns user data with 'name'
  }
  
  // Function to fetch deceased details based on deceased ID
  async function fetchDeceasedName(deceasedId) {
    const accessToken = sessionStorage.getItem('access_token');
    const response = await fetch(`${window.config.BACKEND_URL}/api/deceased/${deceasedId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch deceased with ID ${deceasedId}`);
    }
  
    const deceasedData = await response.json();
    return deceasedData.name; // Assuming the API returns deceased data with 'name'
  }
  
  // Main function to fetch reviews and populate the table
  async function fetchReviews() {
    const accessToken = sessionStorage.getItem('access_token');
  
    try {
      const response = await fetch(`${window.config.BACKEND_URL}/api/deceased/reviews/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const reviews = await response.json();
      
      // Call populateTable once you have reviews
      populateTable(reviews);
  
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }
  
  // Function to populate the table
  async function populateTable(reviews) {
    const tableBody = document.querySelector('#reviews-table tbody');
    tableBody.innerHTML = ''; // Clear table before inserting new rows
  
    // Process each review
    for (const review of reviews) {
        console.log(review)
      try {
        // Fetch user name and deceased name based on IDs
        const userName = await fetchUserName(review.created_by);
        const deceasedName = await fetchDeceasedName(review.deceased);
  
        // Create and insert table row
        const row = document.createElement('tr');
  
        row.innerHTML = `
                <td>${userName}</td>
                <td>${deceasedName}</td>
                <td>${new Date(review.created_at).toLocaleDateString()}</td>
                <td style="width:20px">${review.textfield1}</td>
                <td><img src=${review.imagefield1} height="30"/></td>
                <td style="width:20px">${review.textfield2}</td>
                <td><img src=${review.imagefield2} height="30"/></td>
                <td style="width:20px">${review.textfield3}</td>
                <td><img src=${review.imagefield3} height="30"/></td>
                <td>
                    ${review.approved === true ? 
                    '<button class="btn btn-success" disabled>Approved</button>' : 
                    `<button onclick="ApproveReview(${review.id})" class="btn btn-info">Approve</button>`
                    }
                    <button onclick="deleteReview(${review.id})" class="btn btn-danger">Delete</button>
                </td>
                `;

  
        tableBody.appendChild(row);
  
      } catch (error) {
        console.error('Error fetching details for review:', error);
      }
    }
  }
  
  // Optional: Function to handle review deletion
  async function deleteReview(reviewId) {
    const token = sessionStorage.getItem('access_token')
    
    const confirmed = confirm("Are you sure you want to delete this review?");
    
    if (confirmed) {
      try {
        const response = await fetch(`deceased/reviews/${reviewId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (response.ok) {
          alert('Review deleted successfully.');
          // Remove the deleted review row from the table
          const row = document.querySelector(`tr[data-review-id="${reviewId}"]`);
          if (row) {
            row.remove();
          }
        } else {
          const errorMessage = await response.text();
          console.error('Error deleting review:', errorMessage);
          alert('Failed to delete review. Please try again.');
        }
      } catch (error) {
        console.error('Error during deletion:', error);
        alert('An error occurred while deleting the review.');
      }
    }
  }
  
  
  // Call the fetchReviews function when the page loads
  document.addEventListener('DOMContentLoaded', fetchReviews);


  // Function to approve a review
async function ApproveReview(reviewId) {
    const accessToken = sessionStorage.getItem('access_token');
  
    try {
      const response = await fetch(`${window.config.BACKEND_URL}/api/deceased/reviews/${reviewId}/approve/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: 1 }) // Mark as approved
      });
  
      if (response.ok) {
        alert('Review approved successfully!');
        fetchReviews(); // Reload the table after approval
      } else {
        throw new Error(`Failed to approve review with ID ${reviewId}`);
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  }
  
  // Function to delete a review
  async function deleteReview(reviewId) {
    const accessToken = sessionStorage.getItem('access_token');
  
    try {
      const response = await fetch(`${window.config.BACKEND_URL}/api/deceased/reviews/${reviewId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        alert('Review deleted successfully!');
        fetchReviews(); // Reload the table after deletion
      } else {
        throw new Error(`Failed to delete review with ID ${reviewId}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  }
  
  // Call the fetchReviews function when the page loads
  document.addEventListener('DOMContentLoaded', fetchReviews);
  
  
  
  // ***********************************************8888888888888888