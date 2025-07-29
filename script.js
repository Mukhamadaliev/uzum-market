// ! lelementlarni chaqirish
const catalogBtn = document.querySelector('#catalog-btn');
const catalogMenu = document.querySelector('#catalog-menu');
const favoritesBtn = document.querySelector('#favorites-btn');
const favoritesModal = document.querySelector('#favoritesModal');
const closeFavoritesBtn = document.querySelector('#closeFavoritesBtn');
const favoriteCount = document.querySelector('#favorite-count');
const favoritesList = document.querySelector('#favorites-list');
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const openModalBtn = document.querySelector('.open-modal-kirish');
const modal1 = document.querySelector('.modal-1');
const modal2 = document.querySelector('.modal-2');
const getCodeBtn = document.querySelector('.kodni-olish');
const resendCodeBtn = document.querySelector('.resend-code');
const codeInputs = document.querySelectorAll('.code-input');
const telInput = document.querySelector('.tel-input');
const successMessage = document.querySelector('.success-message');
const errorMessage = document.querySelector('.error-message');
const modalSavat = document.querySelector('modal-savat') // This seems unused, consider removing if not needed


let cart = {}; // ! Bo'sh obyekt

// Savatga mahsulot qo'shish
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const card = btn.closest('.product-card');
        const id = card.getAttribute('data-id');
        const name = card.querySelector('.product-name').textContent;
        const priceText = card.querySelector('.price').textContent;
        const price = parseFloat(priceText.replace(/[^\d]/g, '')); // Extract only numbers for calculation
        const image = card.querySelector('img').src;

        if (cart[id]) {
            cart[id].quantity += 1;
        } else {
            cart[id] = {
                id,
                name,
                price,
                image,
                quantity: 1
            };
        }

        console.log(' Cart:', cart);
        renderCartItems(); // Har qo‘shilganda modalni yangilaydi
    });
});

// Modalni ochish
const cartOpenBtn = document.getElementById('cart-open-btn');
const cartModal = document.getElementById('cart-modal');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartList = document.getElementById('cart-list');
const cartTotalPriceElement = document.getElementById('cart-total-price');

cartOpenBtn.addEventListener('click', function () {
    renderCartItems();
    cartModal.classList.add('show');
});

cartCloseBtn.addEventListener('click', function () {
    cartModal.classList.remove('show');
});

window.addEventListener('click', function (e) {
    if (e.target === cartModal) {
        cartModal.classList.remove('show');
    }
});

// ?  Modalga objectdan ma’lumot chiqarish 
function renderCartItems() {
    cartList.innerHTML = '';
    let totalPrice = 0;

    if (Object.keys(cart).length === 0) {
        cartList.innerHTML = "<p>Savat bo‘sh</p>";
        cartTotalPriceElement.textContent = '0 so\'m';
        return;
    }

    for (let id in cart) {
        const item = cart[id];
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <div class="cart-item-content">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <p class="product-name"><strong>${item.name}</strong></p>
                    <p class="price">${item.price.toLocaleString('uz-UZ')} so'm</p>
                    <div class="quantity-controls">
                        <button class="minus-btn" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="plus-btn" data-id="${item.id}">+</button>
                    </div>
                </div>
            </div>
            <div class="cart-item-total">
                ${itemTotal.toLocaleString('uz-UZ')} so'm
            </div>
        `;
        cartList.appendChild(div);
    }

    cartTotalPriceElement.textContent = `${totalPrice.toLocaleString('uz-UZ')} so'm`;

    // ? Plus va minus tugmalar
    document.querySelectorAll('#cart-list .plus-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            cart[id].quantity += 1;
            renderCartItems(); 
        });
    });

    document.querySelectorAll('#cart-list .minus-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            cart[id].quantity -= 1;
            if (cart[id].quantity <= 0) { 
                delete cart[id]; 
            }
            renderCartItems();
        });
    });
}




// Favorites list
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    updateFavoriteCount();
    markFavoriteProducts();
    setupEventListeners();
});

function setupEventListeners() {
    if (catalogBtn && catalogMenu) {
        catalogBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            catalogMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!catalogBtn.contains(e.target) && !catalogMenu.contains(e.target)) {
                catalogMenu.classList.add('hidden');
            }
        });
    }

    if (favoritesBtn && favoritesModal) {
        favoritesBtn.addEventListener('click', () => {
            updateFavoritesModal();
            favoritesModal.classList.add('show');
        });
    }

    if (closeFavoritesBtn && favoritesModal) {
        closeFavoritesBtn.addEventListener('click', () => {
            favoritesModal.classList.remove('show');
        });
    }

    if (favoritesModal) {
        window.addEventListener('click', (e) => {
            if (e.target === favoritesModal) {
                favoritesModal.classList.remove('show');
            }
        });
    }

    // ? Mahsulotlar tugmasi  kabi
    document.querySelectorAll('.heart-icon').forEach(heart => {
        heart.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleFavorite(this);
        });
    });

    // ? Savatga qo`shish function yasi
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const container = this.closest('.add-to-cart-container');
            const quantitySelector = container.querySelector('.quantity-selector');

            this.classList.add('hidden');
            quantitySelector.classList.remove('hidden');
            quantitySelector.classList.add('visible');
        });
    });

    //? Savat  kartalari miqdorini boshqarish (savat modali emas)
    document.querySelectorAll('.product-card .minus-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            updateProductCardQuantity(this, -1);
        });
    });

    document.querySelectorAll('.product-card .plus-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            updateProductCardQuantity(this, 1);
        });
    });


    // ? Modal 10 boshqaruvlari
    const openModal10 = document.querySelector(".open-modal-10");
    const modal10 = document.querySelector(".modal-10");
    const closeModal10 = document.createElement('span'); 
    closeModal10.classList.add('close-modal-10');
    if (modal10) {
        modal10.querySelector('.modal-content-10').prepend(closeModal10); 
    }


    if (openModal10 && modal10 && closeModal10) {
        openModal10.addEventListener("click", () => {
            modal10.classList.add('show');
            openModal10.style.display = "none";
        });

        closeModal10.addEventListener("click", () => {
            modal10.classList.remove('show');
            openModal10.style.display = "block";
        });
    }

    // ? Auth modallari
    if (openModalBtn && modal1) {
        openModalBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            modal1.classList.add('show');
            telInput.focus();
        });
    }

    document.addEventListener('click', function (e) {
        const isClickOutsideModals = !modal1.contains(e.target) && !modal2.contains(e.target);
        const isNotOpenModalBtn = e.target !== openModalBtn;

        if (isClickOutsideModals && isNotOpenModalBtn) {
            modal1.classList.remove('show');
            modal2.classList.remove('show');
        }
    });


    // Phone number input
    if (telInput) {
        telInput.addEventListener('focus', function () {
            if (!this.value.startsWith('+998')) {
                this.value = '+998';
                this.classList.add('prefix-added');
            }
        });

        telInput.addEventListener('keydown', function (e) {
            if (!/[\d]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                e.preventDefault();
            }
            if (e.key === 'Backspace' && this.selectionStart <= 4 && this.value.startsWith('+998')) {
                e.preventDefault();
            }
        });

        telInput.addEventListener('input', function() {
            if (!this.value.startsWith('+998')) {
                this.value = '+998' + this.value.replace(/[^0-9]/g, '');
                if (this.value.length > 4) {
                    this.setSelectionRange(this.value.length, this.value.length);
                }
            }
        });
    }

    // ? kirish (kodni olish tugmasi)
    if (getCodeBtn) {
        getCodeBtn.addEventListener('click', function () {
            const phoneNumber = telInput.value;

            if (!phoneNumber || phoneNumber.length !== 13 || !phoneNumber.startsWith('+998')) {
                showError('Iltimos, toʻgʻri telefon raqam kiriting! (+998 XX XXX XX XX)');
                return;
            }
            modal1.classList.remove('show');
            modal2.classList.add('show');
            clearMessages();
            if (codeInputs.length > 0) {
                setTimeout(() => codeInputs[0].focus(), 100);
            }
        });
    }

    // ? kodni qayta yuborish
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', function () {
            showSuccess('Kod qayta yuborildi!');
            setTimeout(clearMessages, 3000);
        });
    }

    // ? Kirish kodlari
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, ''); 
            if (this.value.length === 1) {
                if (index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                } else {
                    verifyCode(); 
                }
            }
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });
}

// ? mahsulotlat kartasi miqdori uchun yordamchi funktsiyalar
function updateProductCardQuantity(btn, change) {
    const quantityValue = btn.parentElement.querySelector('.quantity-value');
    let currentQuantity = parseInt(quantityValue.textContent);
    currentQuantity += change;
    if (currentQuantity < 1) {
        const container = btn.closest('.add-to-cart-container');
        const addToCartBtn = container.querySelector('.add-to-cart-btn');
        const quantitySelector = container.querySelector('.quantity-selector');
        quantitySelector.classList.add('hidden');
        addToCartBtn.classList.remove('hidden');
    } else {
        quantityValue.textContent = currentQuantity;
    }
}

function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        console.log(`Qidiruv natijalari: "${query}"`);
    }
}

function toggleFavorite(heartIcon) {
    const productId = heartIcon.dataset.productId;
    const productCard = heartIcon.closest('.product-card');
    const productName = productCard.querySelector('.product-name').textContent;
    const productPrice = productCard.querySelector('.price').textContent;
    const productImageSrc = productCard.querySelector('.product-image img').src;

    const existingIndex = favorites.findIndex(item => item.id === productId);

    if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
        heartIcon.classList.remove('liked');
    } else {
        favorites.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImageSrc
        });
        heartIcon.classList.add('liked');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteCount();
    updateFavoritesModal();
}

function updateFavoriteCount() {
    if (favoriteCount) {
        favoriteCount.textContent = `(${favorites.length})`;
    }
}

function markFavoriteProducts() {
    document.querySelectorAll('.heart-icon').forEach(heart => {
        const productId = heart.dataset.productId;
        if (favorites.some(item => item.id === productId)) {
            heart.classList.add('liked');
        } else {
            heart.classList.remove('liked');
        }
    });
}

function updateFavoritesModal() {
    if (favoritesList) {
        favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="no-favorites">Saralangan mahsulotlar yo\'q.</p>';
        } else {
            favorites.forEach(item => {
                const favoriteItem = document.createElement('div');
                favoriteItem.classList.add('favorite-item');
                favoriteItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="favorite-item-info">
                        <p class="favorite-item-name">${item.name}</p>
                        <span class="favorite-item-price">${item.price}</span>
                    </div>
                    <i class='bx bx-x remove-favorite' data-product-id="${item.id}"></i>
                `;
                favoritesList.appendChild(favoriteItem);
            });

            favoritesList.querySelectorAll('.remove-favorite').forEach(removeBtn => {
                removeBtn.addEventListener('click', function () {
                    const productIdToRemove = this.dataset.productId;
                    favorites = favorites.filter(item => item.id !== productIdToRemove);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    updateFavoriteCount();
                    markFavoriteProducts();
                    updateFavoritesModal();
                });
            });
        }
    }
}

function verifyCode() {
    const enteredCode = Array.from(codeInputs).map(input => input.value).join('');
    if (enteredCode === '12345') {
        showSuccess('');
        setTimeout(() => {
            modal2.classList.remove('show');
            showSuccess('Muvaffaqiyatli kirish!');
            setTimeout(clearMessages, 3000);
        }, 1500);
    } else {
        showError('Notoʻgʻri kod. Iltimos, qayta urinib koʻring.');
    }
}

function showSuccess(msg) {
    if (successMessage) {
        successMessage.textContent = msg;
        successMessage.classList.add('show');
        if (errorMessage) errorMessage.classList.remove('show');
    }
}

function showError(msg) {
    if (errorMessage) {
        errorMessage.textContent = msg;
        errorMessage.classList.add('show');
        if (successMessage) successMessage.classList.remove('show');
    }
}

function clearMessages() {
    if (successMessage) successMessage.classList.remove('show');
    if (errorMessage) errorMessage.classList.remove('show');
}

// ? rasm larni right vs left ga qimilatish
const images = [
    "assets/uzum img 1.png",
    "assets/kanisaner.png",
    "assets/uzum animatsiya.png",
    "assets/uzum animatsiya 2.png",
    "assets/animatsiya uzum 3.png"
];

let current = 0;
const imageElement = document.getElementById("slider-image");

function showImage(index) {
    if (imageElement) {
        imageElement.src = images[index];
    }
}

function prevImage() {
    current = (current === 0) ? images.length - 1 : current - 1;
    showImage(current);
}

function nextImage() {
    current = (current === images.length - 1) ? 0 : current + 1;
    showImage(current);
}

document.addEventListener('DOMContentLoaded', () => {
    showImage(current);
});

// ? modal 10 ta mahsulot
const openModal10 = document.querySelector(".open-modal-10");
const modal10 = document.querySelector(".modal-10");
const closeModal10 = document.querySelector(".close-modal-10");

openModal10.addEventListener("click", () => {
    modal10.style.display = "block";
    openModal10.style.display = "none"; 
});

closeModal10.addEventListener("click", () => {
    modal10.style.display = "none";
    openModal10.style.display = "block"; 
});