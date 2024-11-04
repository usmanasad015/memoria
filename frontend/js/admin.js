function showSection(event, sectionId) {
  event.preventDefault();
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  event.target.classList.add("active");

  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
}

// to get the alll organizations and parnters
document.addEventListener("DOMContentLoaded", function () {
  // Define the API URLs
  const organizationsApiUrl = `${window.config.BACKEND_URL}/api/organizations/`;
  const partnersApiUrl = `${window.config.BACKEND_URL}/api/organizations/partners/`;

  // Fetch data for total organizations
  fetch(organizationsApiUrl, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, // Include token if required
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Check if data is an array and calculate the length
      const totalOrganizations = Array.isArray(data) ? data.length : 0;
      document.getElementById("totalOrganizations").innerText =
        totalOrganizations;
    })
    .catch((error) => console.error("Error fetching organizations:", error));

  // Fetch data for total partners
  fetch(partnersApiUrl, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, // Include token if required
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Check if data is an array and calculate the length
      const totalPartners = Array.isArray(data) ? data.length : 0;
      document.getElementById("totalPartners").innerText = totalPartners;
    })
    .catch((error) => console.error("Error fetching partners:", error));
});

// ****************************************************Oranization ***************************************************************************************

// Add organizations
document
  .getElementById("signupFormorganization")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Clear any existing error messages
    clearErrorMessages();

    // Get form data
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const number = document.getElementById("contact_number").value;
    const location_link = document.getElementById("location_link").value;
    const description = document.getElementById("description").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const image = document.getElementById("image_link").files[0];

    // Retrieve access token from session storage
    const accessToken = sessionStorage.getItem("access_token");

    if (!accessToken) {
      document.getElementById("error-message").innerText =
        "Authentication failed: Access token not found.";
      return; // Stop execution if token is missing
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("contact_number", number);
    formData.append("location_link", location_link);
    formData.append("description", description);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    if (image) {
      formData.append("image", image);
    }

    // Send data using Fetch API with Authorization header
    fetch(`${window.config.BACKEND_URL}/api/organizations/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`, // Pass the access token in the Authorization header
      },
      body: formData, // Use FormData as the body
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            // Handle validation errors or server errors
            if (data) {
              // Display validation errors
              displayValidationErrors(data);
            }
            throw new Error(data.message || "An error occurred");
          }
          return data; // Proceed if the response is OK
        });
      })
      .then((data) => {
        console.log(data);
        // If we reached here, response status was OK
        alert("Organization created successfully!");
        document.getElementById("signupFormorganization").reset();
        loadOrganizations(); // Reload organizations after adding
      })
      .catch((error) => {
        // Handle errors or unexpected issues
        console.error("Error:", error);
        document.getElementById("error-message").innerText =
          "An error occurred: " + error.message;
      });
  });

// Function to clear existing error messages
function clearErrorMessages() {
  document.getElementById("error-name").innerText = "";
  document.getElementById("error-address").innerText = "";
  document.getElementById("error-contact_number").innerText = "";
  // Clear other error messages as needed
}

// Function to display validation errors
function displayValidationErrors(errors) {
  if (errors.name) {
    document.getElementById("error-name").innerText = errors.name;
  }
  if (errors.address) {
    document.getElementById("error-address").innerText = errors.address;
  }
  if (errors.contact_number) {
    document.getElementById("error-contact_number").innerText = errors.contact_number;
  }
  // Display other field-specific errors as needed
}

// View organizations
const accessTokenorganization = sessionStorage.getItem("access_token"); // Replace with your actual access token

document
  .getElementById("view_organization")
  .addEventListener("click", loadOrganizations);

async function loadOrganizations() {
  try {
    const response = await fetch(`${window.config.BACKEND_URL}/api/organizations/`, {
      headers: {
        Authorization: `Bearer ${accessTokenorganization}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const organizations = await response.json();
    const tbody = document.querySelector("#organizationTable tbody");
    tbody.innerHTML = ""; // Clear existing rows

    organizations.forEach((org) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${org.name || "N/A"}</td>
        <td>${org.address || "N/A"}</td>
        <td><img src="${org.image}" height="100"></td>
        <td>${org.contact_number || "N/A"}</td>
        <td>${org.description || "N/A"}</td>
        <td>
          <button class="btn btn-primary" onclick="editOrganization(${
            org.id
          })">Edit</button>
          <button class="btn btn-danger" onclick="removeOrganization(${
            org.id
          })">Remove</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
  }
}

// Remove organization
async function removeOrganization(id) {
  if (
    confirm(`Are you sure you want to delete the organization with ID: ${id}?`)
  ) {
    try {
      const response = await fetch(
        `${window.config.BACKEND_URL}/api/organizations/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Organization deleted successfully");
        loadOrganizations(); // Reload the table after deletion
      } else {
        alert("Error deleting organization");
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  }
}

// Edit organization
let currentOrgId = null;

function editOrganization(orgId) {
  currentOrgId = orgId;

  // Fetch the organization details
  fetch(`${window.config.BACKEND_URL}/api/organizations/${orgId}/`, {
    headers: {
      Authorization: `Bearer ${accessTokenorganization}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((org) => {
      // Populate the form fields with the organization data
      document.getElementById("editName").value = org.name || "";
      document.getElementById("editAddress").value = org.address || "";
      document.getElementById("editContactNumber").value =
        org.contact_number || "";
      document.getElementById("editLocationLink").value =
        org.location_link || "";
      document.getElementById("editDescription").value = org.description || "";
      document.getElementById("editLatitude").value = org.latitude || "";
      document.getElementById("editLongitude").value = org.longitude || "";

      // Open the modal
      new bootstrap.Modal(
        document.getElementById("editOrganizationModal")
      ).show();
    })
    .catch((error) =>
      console.error("Error fetching organization details:", error)
    );
}

document
  .getElementById("editOrganizationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Collect form data
    const formData = new FormData();
    formData.append("name", document.getElementById("editName").value);
    formData.append("address", document.getElementById("editAddress").value);
    formData.append(
      "contact_number",
      document.getElementById("editContactNumber").value
    );
    formData.append(
      "location_link",
      document.getElementById("editLocationLink").value
    );
    formData.append(
      "description",
      document.getElementById("editDescription").value
    );
    formData.append("latitude", document.getElementById("editLatitude").value);
    formData.append(
      "longitude",
      document.getElementById("editLongitude").value
    );

    // Check if a file was selected and append the image only if it exists
    const imageFile = document.getElementById("editImageLink").files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    fetch(`${window.config.BACKEND_URL}/api/organizations/${currentOrgId}/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessTokenorganization}`,
        // Content-Type is not set here because FormData automatically sets the right boundary for multipart forms
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Organization updated:", result);
        // Close the modal
        bootstrap.Modal.getInstance(
          document.getElementById("editOrganizationModal")
        ).hide();
        // Reload the organizations to reflect changes
        loadOrganizations();
      })
      .catch((error) => console.error("Error updating organization:", error));
  });

// **************************************************End Organiztion crud ***************************************************************

// ************************************************* Partner start ***************************************************************************

// Load organizations when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", loadOrganizations);

document.addEventListener("DOMContentLoaded", function () {
  const token = sessionStorage.getItem("access_token"); // Retrieve token from session storage
  const role = sessionStorage.getItem("role");

  if (!token || role !== "admin") {
    // Redirect to login page if the user is not an admin or not logged in
    window.location.href = "/index.html";
  }
  const orgSelect = document.getElementById("organizationpartner"); // Organization dropdown element

  if (token) {
    fetchOrganizations(token);
  }

  function fetchOrganizations(accessToken) {
    fetch(`${window.config.BACKEND_URL}/api/organizations/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`, // Pass token in headers
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        appendOrganizations(data);
      })
      .catch((error) => {
        console.error("Error fetching organizations:", error);
      });
  }

  function appendOrganizations(organizations) {
    organizations.forEach((org) => {
      const option = document.createElement("option");
      option.value = org.id; // Set value as organization ID
      option.textContent = org.name; // Set the display text as organization name
      orgSelect.appendChild(option);
    });
  }

  const signupForm = document.getElementById("signupFormpartner");

signupForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form from reloading the page

  const organizationId = document.getElementById("organizationpartner").value;
  const token = sessionStorage.getItem("access_token"); // Assuming token is stored in sessionStorage

  const formData = {
    username: document.getElementById("name1").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    contact_number: document.getElementById("number").value,
    address: document.getElementById("description1").value,
    shipping_address: document.getElementById("shipping").value,
    organization: organizationId,
  };

  // Clear previous error messages
  clearErrorMessages();

  // Send the form data to the API
  fetch(`${window.config.BACKEND_URL}/api/partner/register/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Pass the access token
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      return response.json().then((data) => {
        if (response.ok) {
          // Handle successful response
          alert("Form submitted successfully!");
          signupForm.reset(); // Clear the form
        } else {
          // Handle validation errors
          handleErrorMessages(data);
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      // Display a general error message
      document.getElementById("error-email").innerText = "An unexpected error occurred.";
    });
});

// Clear error messages from previous submissions
function clearErrorMessages() {
  document.getElementById("error-email").innerText = "";
  // Add additional lines here to clear other fields if needed
}

// Handle validation error messages from the API response
function handleErrorMessages(data) {
  if (data.message) {
    document.getElementById("error-email").innerText = data.message;
  } else if (data.errors) {
    // Check if there are field-specific errors (like `errors.email`)
    if (data.errors.email) {
      document.getElementById("error-email").innerText = data.errors.email[0];
    }
    // Add similar checks for other fields if necessary
  } else {
    document.getElementById("error-email").innerText = "An error occurred.";
  }
}

});

// view partners
const accessTokenartner = sessionStorage.getItem("accessTokenartner"); // Replace with your actual access token

// Function to load partners
// Function to load partners
async function loadPartners() {
  try {
    const response = await fetch(`${window.config.BACKEND_URL}/api/users/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const partners = await response.json();
    const tbody = document.querySelector("#partnerTable tbody");
    tbody.innerHTML = ""; // Clear existing rows

    for (const partner of partners) {
      if (partner.role === "partner") {
        let organizationName = "N/A";
        if (partner.organization) {
          const orgResponse = await fetch(
            `${window.config.BACKEND_URL}/api/organizations/${partner.organization}/`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            organizationName = orgData.name || "N/A";
          }
        }

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${partner.username || "N/A"}</td>
          <td>${partner.email || "N/A"}</td>
          <td>${partner.contact_number || "N/A"}</td>
          <td>${partner.address || "N/A"}</td>
          <td>${organizationName}</td>
          <td>${partner.shipping_address || "N/A"}</td>
          <td>
            <button class="btn btn-primary" onclick="editPartner('${
              partner.id
            }')">Edit</button>
            <button class="btn btn-danger" onclick="removePartner('${
              partner.id
            }')">Remove</button>
          </td>
        `;
        tbody.appendChild(row);
      }
    }
  } catch (error) {
    console.error("Error fetching partners:", error);
  }
}

// Run loadPartners() when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", loadPartners);
document.getElementById("view_partner").addEventListener("click", loadPartners);

// Example: You can also run loadPartners on button clicks, like this:
// document.getElementById('yourButtonId').addEventListener('click', loadPartners);

// edit partners

async function editPartner(partnerId) {
  try {
    const response = await fetch(
      `${window.config.BACKEND_URL}/api/users/${partnerId}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const partner = await response.json();

    // Populate the form with the partner's details
    document.getElementById("editname").value = partner.username || "";
    document.getElementById("editemail").value = partner.email || "";
    document.getElementById("editpassword").value = ""; // Don't pre-fill password
    document.getElementById("editnumber").value = partner.contact_number || "";
    document.getElementById("editdescription1").value =
      partner.description || "";
    document.getElementById("editshipping").value =
      partner.shipping_address || "";

    // Fetch organizations to populate the dropdown
    const orgResponse = await fetch(
      `${window.config.BACKEND_URL}/api/organizations/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!orgResponse.ok) {
      throw new Error(`HTTP error! Status: ${orgResponse.status}`);
    }

    const organizations = await orgResponse.json();
    const organizationSelect = document.getElementById(
      "editorganizationpartner"
    );
    organizationSelect.innerHTML = ""; // Clear existing options

    // Populate the dropdown with organizations
    organizations.forEach((org) => {
      const option = document.createElement("option");
      option.value = org.id; // Assuming `id` is the organization's ID
      option.textContent = org.name; // Assuming `name` is the organization's name
      organizationSelect.appendChild(option);
    });

    // Open the modal
    const partnerModal = new bootstrap.Modal(
      document.getElementById("partnerModal")
    );
    partnerModal.show();

    // Change form action to update
    document.getElementById("editpartner").onsubmit = async function (event) {
      event.preventDefault();
      await updatePartner(partnerId);
    };
  } catch (error) {
    console.error("Error fetching partner details:", error);
  }
}

async function updatePartner(partnerId) {
  const name = document.getElementById("editname").value;
  const email = document.getElementById("editemail").value;
  const password = document.getElementById("editpassword").value;
  const contactNumber = document.getElementById("editnumber").value;
  const description = document.getElementById("editdescription1").value;
  const shippingAddress = document.getElementById("editshipping").value;
  const organization = document.getElementById("editorganizationpartner").value;

  // Create FormData object to handle file upload
  const formData = new FormData();
  formData.append("username", name);
  formData.append("email", email);
  if (password) formData.append("password", password); // Only include password if provided
  formData.append("contact_number", contactNumber);
  formData.append("description", description);
  formData.append("shipping_address", shippingAddress);
  formData.append("organization", organization);

  try {
    const response = await fetch(
      `${window.config.BACKEND_URL}/api/users/${partnerId}/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Partner updated:", result);
    alert("Partner updated successfully");

    // Close the modal
    const partnerModal3 = bootstrap.Modal.getInstance(
      document.getElementById("partnerModal")
    );
    if (partnerModal3) {
      partnerModal3.hide(); // Hide the modal
    }
    // Optionally reload partners
    loadPartners();
  } catch (error) {
    console.error("Error updating partner:", error);
  }
}

// Remove partner
async function removePartner(id) {
  if (
    confirm(`Are you sure you want to delete the partner with email: ${id}?`)
  ) {
    try {
      const response = await fetch(`${window.config.BACKEND_URL}/api/users/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Partner deleted successfully");
        loadPartners(); // Reload the table after deletion
      } else {
        alert("Error deleting partner");
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
    }
  }
}

// Load partners when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", loadPartners);

// ********************************************end aprtner *******************************************************************************

// view user
const accessToken = sessionStorage.getItem("access_token"); // Replace with your actual access token

async function loadUsers() {
  try {
    const response = await fetch(`${window.config.BACKEND_URL}/api/users/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const users = await response.json();

    const viewUserDiv = document.getElementById("viewuser");
    viewUserDiv.innerHTML = ""; // Clear existing content

    const table = document.createElement("table");
    table.className = "table table-striped"; // Add Bootstrap classes or your own styles

    const thead = document.createElement("thead");
    thead.innerHTML = `
            <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Profile Picture</th>
                <th>Contact No</th>
                <th>Address</th>
                <th>Actions</th>
            </tr>
        `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${user.username || ""}</td>
                <td>${user.email || ""}</td>
                <td><img src="${
                  user.profile_picture
                }" height="100" alt="Profile Picture"></td>
                <td>${user.contact_number || ""}</td>
                <td>${user.address || ""}</td>
                <td>
                    <button class="remove-btn btn btn-danger" onclick="removeUser(${
                      user.id
                    })">Remove</button>
                </td>
            `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    viewUserDiv.appendChild(table);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

async function removeUser(id) {
  if (confirm(`Are you sure you want to remove the user with ID: ${id}?`)) {
    try {
      const response = await fetch(`${window.config.BACKEND_URL}/api/users/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        alert("User removed successfully");
        loadUsers(); // Reload table after removal
      } else {
        alert("Error removing user");
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", loadUsers);

// ************************************************ Products ***************************************************************************************

// add product

document
  .getElementById("addproductform")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Create FormData object
    const formData = new FormData(this); // 'this' refers to the form element

    const accessToken = sessionStorage.getItem("access_token"); // Access token from session storage

    try {
      const response = await fetch(`${window.config.BACKEND_URL}/api/products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Do not set Content-Type header when using FormData, the browser will set it automatically
        },
        body: formData,
      });

      if (response.ok) {
        alert("Product added successfully");
        // Optionally, clear the form or redirect
        document.getElementById("addproductform").reset();
      } else {
        const error = await response.json();
        alert("Error adding product: " + JSON.stringify(error)); // Adjust error handling as needed
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product");
      loadProducts()
    }
  });

// view product
const accessTokenview = sessionStorage.getItem("access_token"); // Replace with your actual access token

async function loadProducts() {
  try {
    const response = await fetch(`${window.config.BACKEND_URL}/api/products/`, {
      headers: {
        Authorization: `Bearer ${accessTokenview}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const products = await response.json();
    const tbody = document.querySelector("#product-table tbody");
    tbody.innerHTML = ""; // Clear existing rows

    products.forEach((product) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${product.name || "N/A"}</td>
                <td>${product.vendor_email || "N/A"}</td>
                <td>${product.price || "N/A"}</td>
                <td><img src="${
                  product.image1 || ""
                }" height="100" alt="Image 1"></td>
                <td><img src="${
                  product.image2 || ""
                }" height="100" alt="Image 2"></td>
                <td><img src="${
                  product.image3 || ""
                }" height="100" alt="Image 3"></td>
                <td>${product.description || "N/A"}</td>
                <td>
                    <button class="edit-btn btn btn-primary" onclick="editProduct(${
                      product.id
                    })">Edit</button>
                    <button class="delete-btn btn btn-danger" onclick="deleteProduct(${
                      product.id
                    })">Delete</button>
                </td>
            `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

async function deleteProduct(id) {
  if (confirm(`Are you sure you want to delete the product with ID: ${id}?`)) {
    try {
      const response = await fetch(
        `${window.config.BACKEND_URL}/api/products/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Product deleted successfully");
        loadProducts(); // Reload table after deletion
      } else {
        alert("Error deleting product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }
}

let currentProductId;
function editProduct(id) {
  currentProductId = id;
  fetch(`${window.config.BACKEND_URL}/api/products/${id}/`, {
    headers: {
      Authorization: `Bearer ${accessTokenview}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((product) => {
      // Store existing image URLs for comparison later
      document.getElementById("existing-image1").value = product.image1 || "";
      document.getElementById("existing-image2").value = product.image2 || "";
      document.getElementById("existing-image3").value = product.image3 || "";

      document.getElementById("edit-name").value = product.name || "";
      document.getElementById("edit-email").value = product.vendor_email || "";
      document.getElementById("edit-price").value = product.price || "";
      document.getElementById("edit-description").value =
        product.description || "";
      // Show the modal
      var myModal = new bootstrap.Modal(
        document.getElementById("editProductModal"),
        {}
      );
      myModal.show();
    })
    .catch((error) => console.error("Error fetching product details:", error));
}

// Load products when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", loadProducts);
document.getElementById("view_product").addEventListener("click", loadProducts)

// edit product
document
  .getElementById("editProductForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    // Preserve existing images if new images are not provided
    const existingImage1 = document.getElementById("existing-image1").value;
    const existingImage2 = document.getElementById("existing-image2").value;
    const existingImage3 = document.getElementById("existing-image3").value;

    if (!formData.has("image1") && existingImage1) {
      formData.append("image1", existingImage1);
    }
    if (!formData.has("image2") && existingImage2) {
      formData.append("image2", existingImage2);
    }
    if (!formData.has("image3") && existingImage3) {
      formData.append("image3", existingImage3);
    }

    try {
      const response = await fetch(
        `${window.config.BACKEND_URL}/api/products/${currentProductId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessTokenview}`,
            // Content-Type is not set because FormData handles it automatically
          },
          body: formData,
        }
      );

      if (response.ok) {
        alert("Product updated successfully");
        loadProducts(); // Reload the products list
        var myModal = bootstrap.Modal.getInstance(
          document.getElementById("editProductModal")
        );
        myModal.hide(); // Hide the modal
      } else {
        alert("Error updating product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  });

// ******************************************** Prodcuts *********************************************************************
// Queries
const accessTokenquery = sessionStorage.getItem("access_token"); // Replace with your actual access token

async function loadQueries() {
  try {
    const response = await fetch(`${window.config.BACKEND_URL}/api/queries/`, {
      headers: {
        Authorization: `Bearer ${accessTokenquery}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const queries = await response.json();
    const tbody = document.querySelector("#queries-table tbody");
    tbody.innerHTML = ""; // Clear existing rows

    queries.forEach((query) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${query.name || "N/A"}</td>
                <td>${query.email || "N/A"}</td>
                <td>${query.query_text || "N/A"}</td>
                <td>
                    <button class="remove-btn btn btn-danger" onclick="removeQuery(${
                      query.id
                    })">Remove</button>
                </td>
            `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching queries:", error);
  }
}

async function removeQuery(id) {
  console.log(id);
  if (confirm(`Are you sure you want to remove the query with ID: ${id}?`)) {
    try {
      const response = await fetch(
        `${window.config.BACKEND_URL}/api/queries/${id}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Query removed successfully");
        loadQueries(); // Reload table after deletion
      } else {
        alert("Error removing query");
      }
    } catch (error) {
      console.error("Error removing query:", error);
    }
  }
}

// Load queries when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", loadQueries);

//*************************************************** Orders */

async function fetchOrders() {
  const accessToken = sessionStorage.getItem("access_token");

  try {
    const response = await fetch(`${window.config.BACKEND_URL}/api/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const orders = await response.json();
      console.log("orders: " + JSON.stringify(orders));
      displayOrders(orders);
    } else {
      console.error("Failed to fetch orders.");
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

function displayOrders(orders) {
  const ordersTableBody = document.querySelector("#ordersTable tbody");
  ordersTableBody.innerHTML = ""; // Clear existing rows

  if (orders.length === 0) {
    ordersTableBody.innerHTML =
      "<tr><td colspan='7'>No orders found.</td></tr>";
    return;
  }

  orders.forEach((order) => {
    console.log("orders ", order);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.user}</td>
      <td>${order.items.map((product) => product.id).join(", ")}</td>
      <td>${order.status}</td>
      <td>${order.total_amount}</td>
      <td>${new Date(order.order_date).toLocaleDateString()}</td>
      <td><button class="btn btn-primary view-button" data-order-id="${
        order.items.id
      }" data-items='${JSON.stringify(order.items)}'>View</button></td>
    `;
    ordersTableBody.appendChild(row);
  });

  // Attach event listeners to all "View" buttons
  document.querySelectorAll(".view-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const items = JSON.parse(event.target.getAttribute("data-items"));
      fetchProductDetails(items);
    });
  });
}

async function fetchProductDetails(items) {
  console.log("Fetching product details...", items);
  const productList = document.querySelector("#productList");
  productList.innerHTML = ""; // Clear existing items

  for (const item of items) {
    const productId = item.product; // Accessing the product ID from the item

    try {
      const response = await fetch(
        `${window.config.BACKEND_URL}/api/products/${productId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.ok) {
        const product = await response.json();
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.innerHTML = `
          <img src="${product.image1}" alt="${product.name}" style="width: 50px; height: 50px;" />
          <strong>${product.name}</strong><br/>
          Vendor Email: ${product.vendor_email}<br/>
          Quantity: ${item.quantity}<br/>
          Price: ${product.price}
        `;
        productList.appendChild(listItem);
      } else {
        console.error(`Failed to fetch product with ID ${productId}.`);
      }
    } catch (error) {
      console.error(`Error fetching product with ID ${productId}:`, error);
    }
  }

  // Show the modal after loading all products
  const productModal = new bootstrap.Modal(
    document.getElementById("productModal")
  );
  productModal.show();
}

// Call fetchOrders on page load or whenever needed
document.addEventListener("DOMContentLoaded", fetchOrders);

//********************************************************************** QRcodes  */
// Function to populate the select dropdown
async function populatePartners() {
  // Replace with your actual access token
  const accessToken = sessionStorage.getItem("access_token");

  if (!accessToken) {
    alert("Access token not found. Please log in.");
    return;
  }

  try {
    // Fetch users from the API
    const response = await fetch(`${window.config.BACKEND_URL}/api/users/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Check if the request was successful
    if (response.ok) {
      const users = await response.json();

      // Find the select element
      const selectElement = document.getElementById("partnerSelect");

      // Loop through the users and add only partners
      users.forEach((user) => {
        if (user.role === "partner") {
          const option = document.createElement("option");
          option.value = user.id; // Assuming the user ID is what you want in the value
          option.textContent = user.username; // Display the partner's name in the dropdown
          selectElement.appendChild(option);
        }
      });
    } else {
      // Handle errors
      const errorData = await response.json();
      console.error("Error fetching users:", errorData);
      alert("Failed to fetch partners.");
    }
  } catch (error) {
    // Handle network errors
    console.error("Error:", error);
    // alert("Failed to fetch partners. Please try again later.");
  }
}

// Call the function to populate the select when the page loads
let showUnassigned = true; // Initial state to show unassigned first

document.addEventListener("DOMContentLoaded", populatePartners);

// Function to fetch QR codes and populate the table

let selectedQrcodeIds = [];

// Function to fetch QR codes and populate the table
function fetchQRCodes() {
  fetch(`${window.config.BACKEND_URL}/api/qrcode/qrcodes/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.querySelector("#qrcodeTable tbody");
      tbody.innerHTML = ""; // Clear existing rows

      // Sort the data based on the status
      const sortedData = data.sort((a, b) => {
        if (showUnassigned) {
          return (
            (a.status === "unassigned" ? -1 : 1) -
            (b.status === "unassigned" ? -1 : 1)
          );
        } else {
          return (
            (a.status === "assigned" ? -1 : 1) -
            (b.status === "assigned" ? -1 : 1)
          );
        }
      });

      // Populate the table with sorted data
      sortedData.forEach((qrcode) => {
        const row = `
              <tr>
                  <td><input type="checkbox" class="form-check-input" data-qrcode-id="${
                    qrcode.id
                  }" /></td>
                  <td>${qrcode.id}</td>
                  <td>${qrcode.hovercode_id}</td>
                  <td>${qrcode.partner || ""}</td>
                  <td>${qrcode.deceased_id || ""}</td>
                  <td>${qrcode.url}</td>
                  <td>${qrcode.status}</td>
                  <td><button class="btn btn-info">Edit</button></td>
              </tr>
          `;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      // Add event listener to each checkbox
      tbody.querySelectorAll(".form-check-input").forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const qrcodeId = e.target.getAttribute("data-qrcode-id");
          if (e.target.checked) {
            // Add the QR code row ID to the selected array
            selectedQrcodeIds.push(qrcodeId);
          } else {
            // Remove the QR code row ID from the selected array
            selectedQrcodeIds = selectedQrcodeIds.filter(
              (id) => id !== qrcodeId
            );
          }
          console.log("Selected QR Code Row IDs:", selectedQrcodeIds); // For debugging
        });
      });

      // Add click event listener to Edit buttons
      tbody.querySelectorAll(".btn-info").forEach((button, index) => {
        button.addEventListener("click", () => {
          const qrcode = sortedData[index]; // Get the corresponding QR code data

          // Set the QR code row ID instead of hovercode_id
          document.getElementById("hovercodeId").value = qrcode.id;
          document.getElementById("url").value = qrcode.url;
          document.getElementById("status").value = qrcode.status;

          // Fetch and populate partners and deceased
          
          fetchPartners().then((partners) => {
            const partnerSelect = document.getElementById("partnerId");
            partnerSelect.innerHTML = ""; // Clear existing options
          
            // Add default 'Select Partner' option
            const defaultPartnerOption = document.createElement("option");
            defaultPartnerOption.value = "";
            defaultPartnerOption.textContent = "Select Partner";
            defaultPartnerOption.disabled = true; 
            partnerSelect.appendChild(defaultPartnerOption);
          
            // Add the fetched partners as options
            partners.forEach((partner) => {
              const option = document.createElement("option");
              option.value = partner.id;
              option.textContent = partner.username; 
          
              // Check if the current partner matches the QR code's partner
              if (partner.id === qrcode.partner) {
                option.selected = true; // Set as selected if it matches
              }
          
              partnerSelect.appendChild(option);
            });
          });
          

          // Fetch and populate deceased
          fetchDeceased().then((deceasedList) => {
            const deceasedSelect = document.getElementById("deceasedId");
            deceasedSelect.innerHTML = ""; // Clear existing options

            // Add default 'Select Deceased' option
            const defaultDeceasedOption = document.createElement("option");
            defaultDeceasedOption.value = "";
            defaultDeceasedOption.textContent = "Select Deceased";
            defaultDeceasedOption.disabled = true; // Option can't be selected
            defaultDeceasedOption.selected = true; // Option is selected by default
            deceasedSelect.appendChild(defaultDeceasedOption);

            // Add the fetched deceased as options
            deceasedList.forEach((deceased) => {
              const option = document.createElement("option");
              option.value = deceased.id;
              option.textContent = deceased.name; // Assuming deceased has a 'name' property
              deceasedSelect.appendChild(option);
            });
          });

          // Show the modal
          var modal = new bootstrap.Modal(
            document.getElementById("editQRCodeModal")
          );
          modal.show();
        });
      });
    })
    .catch((error) => console.error("Error fetching QR codes:", error));
}

// single edit partner
document
  .getElementById("editQRCodeForm")
  .addEventListener("submit", function (event) {
    console.log("Edit QRCode");
    event.preventDefault(); // Prevent default form submission

    const hovercodeId = document.getElementById("hovercodeId").value;
    const partnerId = document.getElementById("partnerId").value;
    const deceasedId = document.getElementById("deceasedId").value;

    console.log(partnerId + " " + deceasedId);

    // Ensure partner is selected before deceased
    if (!partnerId) {
      alert("Please select a partner first.");
      return;
    }

    // Update partner first
    fetch(
      `${window.config.BACKEND_URL}/api/qrcode/qrcodes/${hovercodeId}/assign_partner/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partner_id: partnerId }),
      }
    )
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to assign partner");
        }
        return response.json();
      })
      .then(() => {
        // Update deceased after partner is assigned
        return fetch(
          `${window.config.BACKEND_URL}/api/qrcode/qrcodes/${hovercodeId}/update_deceased/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ deceased_id: deceasedId }),
          }
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update deceased");
        }
        return response.json();
      })
      .then((data) => {
        // Show success alert after both partner and deceased are successfully assigned
        alert("Partner and deceased assigned successfully!");

        // Optionally close the modal
        var modal = bootstrap.Modal.getInstance(
          document.getElementById("editQRCodeModal")
        );
        modal.hide();

        // Refresh QR code table
        fetchQRCodes(); // Refresh the table to show updated data
      })
      .catch((error) => {
        console.error("Error updating QR code:", error);
        alert("An error occurred while updating. Please try again.");
      });
  });

// Listen for changes on the partner select dropdown
document.getElementById("partnerSelect").addEventListener("change", () => {
  const selectedPartnerId = document.getElementById("partnerSelect").value;
  console.log("Selected partner ID:", selectedPartnerId);

  // Ensure that at least one QR code row is selected
  if (selectedQrcodeIds.length === 0) {
    alert("Please select at least one QR code.");
    return;
  }

  // Ensure a valid partner ID is selected
  if (!selectedPartnerId || selectedPartnerId === "") {
    alert("Please select a valid partner.");
    return;
  }

  // Call the function to assign the partner to multiple QR codes
  assignPartnerToQRCodes(selectedQrcodeIds, selectedPartnerId);

  // Clear the selected IDs after assignment
  selectedQrcodeIds = [];
});

// Function to assign a partner to multiple QR codes

function assignPartnerToQRCodes(qrCodesIds, partnerId) {
  console.log("Assigning partner ID: " + partnerId);
  console.log("QR Codes Row IDs: ", qrCodesIds);

  fetch(`${window.config.BACKEND_URL}/api/qrcode/qrcodes/assign_multiple_partners/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      partner_id: partnerId,
      qr_code_ids: qrCodesIds, // Sending array of QR code row IDs and partner_id
    }),
  })
    .then((response) => {
      if (response.ok) {
        alert("Partner assigned to selected QR codes successfully.");
      } else {
        alert("Failed to assign partner to the QR codes.");
      }
      fetchQRCodes(); // Reload the table with updated data
    })
    .catch((error) => console.error("Error assigning partner:", error));
}

function fetchPartners() {
  return fetch(`${window.config.BACKEND_URL}/api/users/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => data.filter((user) => user.role === "partner"));
}

function fetchDeceased() {
  return fetch(`${window.config.BACKEND_URL}/api/deceased/?all=true`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
}

// Function to assign partner to a QR code

// Event listener for the filter button
document.getElementById("filterUnassignedBtn").addEventListener("click", () => {
  showUnassigned = !showUnassigned; // Toggle the filter state
  fetchQRCodes(); // Fetch the QR codes again with the new filter
});

// Bulk QR code creation
document.getElementById("bulkDownloadBtn").addEventListener("click", () => {
  const loader = document.getElementById("loader");

  // Show the loader
  loader.style.display = "block";
  loader.style.display = "flex";
  fetch(`${window.config.BACKEND_URL}/api/qrcode/qrcodes/create_bulk/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ number_of_qr_codes: 5 }),
  })
    .then((response) => response.json())
    .then((data) => {
      loader.style.display = "none";
      alert("Bulk QR codes created successfully");
      fetchQRCodes(); // Reload the table with new QR codes
    })
    .catch((error) => {
      loader.style.display = "none";
      console.error("Error creating QR codes:", error);
    });
}); 

// Fetch QR codes when the page loads
window.onload = fetchQRCodes;
