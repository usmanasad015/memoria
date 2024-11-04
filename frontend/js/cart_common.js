
const getUserId = () => sessionStorage.getItem("user_id");
const accessToken = sessionStorage.getItem("access_token");

const updateCartCount = async () => {
  const userId = getUserId();
  if (!userId) {
    return;
  }

  if (!window.config || !window.config.BACKEND_URL) {
    console.error("Configuration is not loaded");
    return;
  }

  try {
    const response = await fetch(
      `${window.config.BACKEND_URL}/api/cart/${userId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      const cartData = await response.json();
      console.log("Cart data:", cartData);
      const cartCount = cartData.length;
      document.getElementById("cartCount").textContent = `(${cartCount})`;
    } else {
      console.error("Failed to fetch cart details");
    }
  } catch (error) {
    console.error("Error fetching cart details:", error);
  }
};

document.addEventListener("DOMContentLoaded", updateCartCount);

// Function to load the navbar HTML
fetch("navbar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;
    loadNavBar();

    // To fetch cart products start
    document
      .getElementById("cartBtn")
      .addEventListener("click", async function () {
        const accessToken = sessionStorage.getItem("access_token");
        const userId = sessionStorage.getItem("user_id");

        if (!accessToken) {
          console.error("Access token not found in session.");
          return;
        }

        try {
          const cartResponse = await fetch(
            `${config.BACKEND_URL}/api/cart/${userId}/`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          const cartData = await cartResponse.json();
          const cartItems = document.getElementById("cartItems");
          const totalPriceElement = document.getElementById("totalPrice");
          let totalPrice = 0;

          cartItems.innerHTML = ""; // Clear the table body before populating

          await Promise.all(
            cartData.map(async (item) => {
              const productResponse = await fetch(
                `${config.BACKEND_URL}/api/products/${item.product}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              const product = await productResponse.json();
              const row = document.createElement("tr");

              // Calculate total price
              totalPrice += product.price * item.quantity;

              row.innerHTML = `
              <td>${product.name}</td>
              <td>
                <img src="${product.image1}" alt="${product.name}" class="img-thumbnail" style="width: 50px; height: 50px;">
              </td>
              <td>${item.quantity}</td>
              <td>
                <button class="btn btn-sm" style="background-color: #ff7675; border: none; color: white" onclick="removeFromCart(${item.id}, ${product.price}, ${item.quantity})">
                  Remove
                </button>
              </td>
            `;

              cartItems.appendChild(row);
            })
          );

          // Update total price display
          totalPriceElement.textContent = `Total: $${totalPrice.toFixed(
            2
          )}`;
          const modalFooter = document.querySelector(
            "#cartModal .modal-footer"
          );
          if (modalFooter) {
            // Check if the button already exists
            let existingButton = document.getElementById("checkoutBtn");
            if (!existingButton) {
              const checkoutButton = document.createElement("button");
              checkoutButton.type = "button";
              checkoutButton.className = "btn";
              checkoutButton.id = "checkoutBtn";
              checkoutButton.style.cssText = `
  background-color: #00b894;
  border: none;
  font-weight: bold;
  padding: 10px 30px;
  color: white;
`;
              checkoutButton.textContent = "Proceed to Checkout";
              checkoutButton.addEventListener("click", async () => {
                // Define the checkout functionality here
                await handleCheckout();
              });
              modalFooter.appendChild(checkoutButton);
            }
          } else {
            console.error("Modal footer not found.");
          }

          // Show the modal after data is loaded
          const cartModal = new bootstrap.Modal(
            document.getElementById("cartModal"),
            {}
          );
          cartModal.show();
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      });
  })
  .catch((error) => console.error("Error loading Navbar:", error));

//

// Remove from the cart
// Function to handle item removal and update total price
function removeFromCart(productId, productPrice, quantity) {
  const accessToken = sessionStorage.getItem("access_token");

  if (!accessToken) {
    console.error("Access token not found in session.");
    return;
  }

  fetch(`${config.BACKEND_URL}/api/cart/${productId}/delete/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
    }),
  })
    .then((response) => {
      if (response.ok) {
        console.log(`Product ID ${productId} removed from cart.`);

        // Deduct the product price from total price
        const totalPriceElement = document.getElementById("totalPrice");
        let currentTotal = parseFloat(
          totalPriceElement.textContent.replace("Total: $", "")
        );
        const newTotal = currentTotal - productPrice * quantity;
        totalPriceElement.textContent = `Total: $${newTotal.toFixed(2)}`;

        // Reload the cart to reflect the removal
        document.getElementById("cartBtn").click();
      } else {
        console.error("Failed to remove product from cart.");
      }
    })
    .catch((error) => console.error("Error removing product:", error));
}

async function handleCheckout() {
  // Create and display a loader
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.style.position = "fixed";
  loader.style.top = "50%";
  loader.style.left = "50%";
  loader.style.transform = "translate(-50%, -50%)";
  loader.style.zIndex = "9999";
  loader.style.border = "8px solid #f3f3f3"; // Light gray border
  loader.style.borderTop = "8px solid #3498db"; // Blue border top
  loader.style.borderRadius = "50%";
  loader.style.width = "60px";
  loader.style.height = "60px";
  loader.style.animation = "spin 1s linear infinite";

  // Add the loader to the body
  document.body.appendChild(loader);

  // Keyframes for spinning animation
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  try {
    const accessToken = sessionStorage.getItem("access_token");
    // const deceasedId = document.getElementById("deceasedSelect").value;
    const userId = getUserId();

    if (!accessToken || !userId) {
      console.error("Access token or user ID not found.");
      return;
    }

    const cartItems = await fetchCartItems(); // Fetch cart items

    // Fetch product details for calculating total amount
    const products = await Promise.all(
      cartItems.map((item) =>
        fetch(
          `${window.config.BACKEND_URL}/api/products/${item.product}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        ).then((response) => response.json())
      )
    );

    const transformedData = cartItems.map((item) => {
      const product = products.find((p) => p.id === item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const totalAmount = transformedData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderDetails = {
      user: userId,
      items: transformedData,
      status: "Pending",
      total_amount: totalAmount,
      // deceased: deceasedId,
    };

    // Save the order details
    const response = await fetch(
      `${window.config.BACKEND_URL}/api/orders/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderDetails),
      }
    );

    if (response.ok) {
      const result = await response.json();
      const orderId = result.id;

      // Send order confirmation email
      const emailResponse = await fetch(
        `${window.config.BACKEND_URL}/api/send-order-emails/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ order_id: orderId }),
        }
      );

      if (emailResponse.ok) {
        console.log("Order email sent successfully.");
      } else {
        console.error("Failed to send order email.");
      }

      // Create Stripe checkout session
      const stripeResponse = await fetch(
        `${window.config.BACKEND_URL}/api/create-checkout-session/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            products: transformedData.map((item) => {
              const product = products.find((p) => p.id === item.product);
              return {
                name: product.name,
                amount: product.price * 100, // Convert price to cents
                quantity: item.quantity,
              };
            }),
          }),
        }
      );

      if (stripeResponse.ok) {
        const stripeResult = await stripeResponse.json();
        const stripeUrl = stripeResult.url;

        // Hide the loader before redirecting to Stripe
        document.body.removeChild(loader);

        // Redirect to Stripe checkout
        window.location.href = stripeUrl;
      } else {
        console.error("Failed to create Stripe checkout session.");
        document.body.removeChild(loader); // Hide loader on error
      }

      // Clear cart or update UI if necessary
      await updateCartCount();
    } else {
      console.error("Failed to place order.");
      document.body.removeChild(loader); // Hide loader on error
    }
  } catch (error) {
    console.error("Error placing order:", error);
    document.body.removeChild(loader); // Hide loader on
  }
}


// fetch
async function fetchCartItems() {
  const userId = getUserId();
  const accessToken = sessionStorage.getItem("access_token");

  if (!userId || !accessToken) {
    console.error("User ID or access token not found.");
    return [];
  }

  try {
    const response = await fetch(
      `${window.config.BACKEND_URL}/api/cart/${userId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch cart items.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return [];
  }
}
