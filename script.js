"use strict";

async function fetchProduct() {
  try {
    const response = await fetch(
      "https://cdn.shopify.com/s/files/1/0564/3685/0790/files/singleProduct.json?v=1701948448"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const product = await response.json();
    renderProduct(product.product);
  } catch (error) {
    console.error("Fetch error:", error);
    document.getElementById("product-container").innerText =
      "Failed to load product data.";
  }
}

const images = [
  { id: 0, src: "./assets/images/firstImg.png" },
  { id: 1, src: "./assets/images/secondImg.png" },
  { id: 2, src: "./assets/images/thirdImg.png" },
  { id: 3, src: "./assets/images/fourthImg.png" },
  { id: 4, src: "./assets/images/fourthImg.png" },
];

function calculateDiscountPercent(price, compareAtPrice) {
  const originalPrice = parseFloat(compareAtPrice.replace("$", ""));
  const discountedPrice = parseFloat(price.replace("$", ""));
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return discount.toFixed(0);
}

function renderProduct(product) {
  const productContainer = document.getElementById("product-container");
  const discountPercent = calculateDiscountPercent(
    product.price,
    product.compare_at_price
  );

  const productHTML = `
  <div class="main-container">
    <div class="images">
      ${images
        .map(
          (image, index) =>
            `<img src="${image.src}" alt="${
              product.title
            }" data-index="${index}" class="product-image ${
              index === 0 ? "selected main-image" : ""
            }">`
        )
        .join("")}
    </div>
    <div class="product">
      <p class="vendor">${product.vendor}</p>
      <h1>${product.title}</h1>
      <div class="divider"></div>
      <div class="price">
        <div class="price-row">
          <p class="discounted-price">${product.price}.00</p>
          <span class="discount">${discountPercent}% Off</span>
        </div>
        <p class="original-price">${product.compare_at_price}.00</p>
      </div>
      <div class="divider"></div>
      <div class="options">
        <div class="option">
          <label>Choose a ${product.options[0].name}</label>
          <div class="colors-select">
            ${product.options[0].values
              .map((color) => {
                const colorName = Object.keys(color)[0];
                const colorCode = color[colorName];
                return `
                  <div 
                    class="color-option"
                    style="background-color: ${colorCode};" 
                    data-color="${colorName}"
                    onclick="selectColor(this)"
                  >
                    <div class="color-border"></div>
                    <img class="tick" src="./assets/svg/tick.svg" alt="selected" style="display: none;">
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
        <div class="divider"></div>
        <div class="option">
          <label>Choose a ${product.options[1].name}</label>
          <div class="sizes">
            ${product.options[1].values
              .map(
                (size) => `
                  <div class="size">
                    <input class="input" type="radio" name="size" value="${size}" style="margin-right: 5px;" />
                    ${size}
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="add-to-cart-section">
          <div class="no-of-items">
            <button class="btns" id="decrease-btn">-</button>
            <strong id="item-count">1</strong>
            <button class="btns" id="increase-btn">+</button>
          </div>
          <button class="add-to-cart">
            <img src="./assets/svg/bag.svg" alt="bag"/>
            Add to Cart
          </button>
        </div>
        <div id="cart-message" class="cart-message"></div>
      </div>
      <div class="divider"></div>
      <div class="description">${product.description}</div>
    </div>
  </div>
  `;

  productContainer.innerHTML = productHTML;

  let itemCount = 1;
  let selectedSize = null;
  let selectedColor = null;

  document.getElementById("decrease-btn").addEventListener("click", () => {
    if (itemCount > 1) {
      itemCount--;
      document.getElementById("item-count").innerText = itemCount;
    }
  });

  document.getElementById("increase-btn").addEventListener("click", () => {
    itemCount++;
    document.getElementById("item-count").innerText = itemCount;
  });

  document.querySelectorAll('input[name="size"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      selectedSize = event.target.value;
    });
  });

  document.querySelectorAll(".color-option").forEach((option) => {
    option.addEventListener("click", () => {
      // Remove border from all options
      document.querySelectorAll(".color-option").forEach((opt) => {
        opt.classList.remove("selected");
      });
      // Add border to selected option
      option.classList.add("selected");

      // Remove tick from all options
      document.querySelectorAll(".tick").forEach((tick) => {
        tick.style.display = "none";
      });
      // Show tick on selected option
      option.querySelector(".tick").style.display = "block";

      // Update selectedColor variable
      selectedColor = option.getAttribute("data-color");
    });
  });

  document.querySelector(".add-to-cart").addEventListener("click", () => {
    const cartMessage = document.getElementById("cart-message");
    cartMessage.style.display = "block";
    cartMessage.innerHTML = `
    ${product.title} with
    Color ${selectedColor} and
    Size ${selectedSize}
    added to cart
    `;
  });

  // Add event listeners to images for selection
  document.querySelectorAll(".product-image").forEach((image) => {
    image.addEventListener("click", () => {
      // Remove selected class from all images
      document.querySelectorAll(".product-image").forEach((img) => {
        img.classList.remove("selected");
      });
      // Add selected class to clicked image
      image.classList.add("selected");

      // Move selected image to the first position in images array
      const index = parseInt(image.getAttribute("data-index"));
      if (index > 0) {
        const selectedImage = images.splice(index, 1)[0];
        images.unshift(selectedImage);
      }

      // Re-render images to reflect new order and selections
      renderImages();
    });
  });

  // Initial render of images
  renderImages();
}

function renderImages() {
  const imagesContainer = document.querySelector(".images");
  imagesContainer.innerHTML = images
    .map(
      (img, idx) =>
        `<img src="${
          img.src
        }" alt="Product Image" data-index="${idx}" class="product-image ${
          idx === 0 ? "selected main-image" : ""
        }">`
    )
    .join("");
}

// Fetch and render the product on page load
fetchProduct();

function selectColor(element) {
  // Remove border from all options
  document.querySelectorAll(".color-option").forEach((opt) => {
    opt.classList.remove("selected");
  });
  // Add border to selected option
  element.classList.add("selected");

  // Remove tick from all options
  document.querySelectorAll(".tick").forEach((tick) => {
    tick.style.display = "none";
  });
  // Show tick on selected option
  element.querySelector(".tick").style.display = "block";
}
