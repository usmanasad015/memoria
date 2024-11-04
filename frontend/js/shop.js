document.addEventListener('DOMContentLoaded', async () => {
    const productContainer = document.getElementById('product-container');
    const accessToken = sessionStorage.getItem('access_token'); // Get the access token from session storage

    try {
        const response = await fetch(`${window.config.BACKEND_URL}/api/products/`, {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const products = await response.json();

        // Clear any existing content
        productContainer.innerHTML = '';

        // Iterate over products and create cards
        products.forEach(product => {
            const cardHTML = `
                <div class="col-12 col-sm-6 col-md-3 col-lg-3 mt-4 product-card" data-product-id="${product.id}">
                    <div class="card h-100" style="padding: 6px">
                        <div style="height: 240px; overflow: hidden">
                            <img
                                class="card-img-top w-100 h-100"
                                src="${product.image1}"
                                style="object-fit: cover"
                                alt="${product.name}"
                            />
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h6 class="card-title">${product.name}</h6>
                            <p class="card-text flex-grow-1">
                                <span class="product_dollar">$${product.price}</span>
                                <span class="hero_section__shipping">One time fees</span>
                            </p>
                            <button
                                type="button"
                                class="btn btn-sm mt-auto dearest_search_btn"
                            >
                                <b>View</b>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            productContainer.innerHTML += cardHTML;
        });

        // Add click event listener to each product card
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                window.location.href = `product.html?product_id=${productId}`;
            });
        });

    } catch (error) {
        console.error('Error fetching product data:', error);
    }
});
