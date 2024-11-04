
    
    document.addEventListener('DOMContentLoaded', function () {
      const token = sessionStorage.getItem('access_token');
      const role = sessionStorage.getItem('role');
  
      if (!token || role !== 'partner') {
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
    const user = document.getElementById('user').value;
        if (user) formData.append('user', user);

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


    // user
    document.getElementById('signupFormuser').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        
        // Get form data
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Clear any previous error messages
        const errorDiv = document.getElementById('error-message');
        errorDiv.innerHTML = ''; // Clear previous error messages
        
        // Check if passwords match
        if (password !== confirmPassword) {
          errorDiv.innerHTML = 'Passwords do not match!';
          errorDiv.style.color = 'red';
          return;
        }
        
        // Create data object
        const data = {
          username: username,
          email: email,
          password: password,
          password2: confirmPassword,
        };
        
        // Send POST request to API
        fetch(`${window.config.BACKEND_URL}/api/register/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        .then(response => {
            if (response.status === 201 || response.status === 200) {
              alert('Form submitted successfully!');
              document.getElementById('signupFormuser').reset();
    
                // Redirect if the status is 201 Created
                // window.location.href = 'http://127.0.0.1:5500/login.html'; // Use the correct URL here

            } else {
                return response.json();  // If not 201, return the response as JSON
            }
        })// Convert response to JSON
        .then(data => {
            console.log(data);  // Check the full response
          if (data) {
            document.getElementById('signupFormuser').reset();
            // window.location.href = 'http://127.0.0.1:5500/login.html'; // Use the correct URL here
            // Adjust as needed
          } else {
            // Handle server-side validation errors for all fields
            if (data.username) {
              const errorMessage = data.username.join(', ');
              errorDiv.innerHTML += `<p style="color: red;">Username: ${errorMessage}</p>`;
            }
            
            if (data.password) {
              const errorMessage = data.password.join(', ');
              errorDiv.innerHTML += `<p style="color: red;">Password: ${errorMessage}</p>`;
            }
    
            if (data.password2) {
              const errorMessage = data.password2.join(', ');
              errorDiv.innerHTML += `<p style="color: red;">Confirm Password: ${errorMessage}</p>`;
            }
    
            if (data.email) {
              const errorMessage = data.email.join(', ');
              errorDiv.innerHTML += `<p style="color: red;">Email: ${errorMessage}</p>`;
            }
    
            // Handle any additional errors
            if (!data.username && !data.password && !data.password2 && !data.email) {
              errorDiv.innerHTML = 'Signup failed. Please try again.';
              errorDiv.style.color = 'red';
            }
          }
        })
        .catch(error => {
          console.error('Error:', error);
          errorDiv.innerHTML = 'An error occurred. Please try again.';
          errorDiv.style.color = 'red';
        });
      });
    

      const accessToken = sessionStorage.getItem("access_token"); // Replace with your actual access token

async function loadUsers() {
    try {
        const response = await fetch(`${window.config.BACKEND_URL}/api/users/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const users = await response.json();

        const userSelect = document.getElementById('user');
        userSelect.innerHTML = '<option value="" selected disabled>Select user</option>'; // Clear existing options

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id; // Assuming the user ID is in user.id
            option.textContent = user.username; // Assuming the username is in user.username; adjust as necessary
            userSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadUsers);



// qr code 
document.getElementById("qrcode").addEventListener("click", function fetchQRCodes() {
    console.log("Requesting QR codes...");

    // Fetch QR codes from the API
    fetch(`${window.config.BACKEND_URL}/api/qrcode/qrcodes/assigned_qrcodes/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`, // Ensure accessToken is defined
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const tbody = document.querySelector('#qrcodeTable tbody');
        tbody.innerHTML = ''; // Clear existing rows

        // Loop through the data and create rows with a Bootstrap-styled status dropdown
        data.forEach(qrcode => {
            const row = `
                <tr>
                    <td>${qrcode.id}</td>
                    <td>${qrcode.hovercode_id}</td>
                    <td>${qrcode.partner || ''}</td>
                    <td>${qrcode.deceased_id || ''}</td>
                    <td>${qrcode.url}</td>
                    <td>
                        <select class="form-select status-dropdown" data-id="${qrcode.id}">
                            <option value="assigned" ${qrcode.status === 'assigned' ? 'selected' : ''}>Assigned</option>
                            <option value="unassigned" ${qrcode.status === 'unassigned' ? 'selected' : ''}>Unassigned</option>
                            <option value="delivered" ${qrcode.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });

        // Add event listener to all dropdowns to handle status change
        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', function () {
                const qrcodeId = this.getAttribute('data-id'); // Get QR code ID
                const newStatus = this.value; // Get selected status
                updateQRCodeStatus(qrcodeId, newStatus); // Call function to update status
            });
        });
    })
    .catch(error => console.error('Error fetching QR codes:', error));
});

// Function to update QR code status
function updateQRCodeStatus(qrcodeId, newStatus) {
    console.log(`Updating QR code ID ${qrcodeId} to status ${newStatus}...`);

    fetch(`${window.config.BACKEND_URL}/api/qrcode/qrcodes/update_qrcode_status/`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`, // Ensure accessToken is defined
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: qrcodeId, // Send the QR code ID
            status: newStatus // Send the new status
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update QR code status');
        }
        return response.json();
    })
    .then(data => {
        console.log("Status updated successfully:", data);
        alert('QR code status updated successfully!');
    })
    .catch(error => {
        console.error('Error updating QR code status:', error);
        alert('Failed to update QR code status.');
    });
}

