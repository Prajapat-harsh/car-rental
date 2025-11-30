// ====== ELEMENTS ======
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');
const header = document.querySelector('header');
const navLinks = document.querySelectorAll('.navbar a');
const sections = document.querySelectorAll('section[id]');
const form = document.querySelector('.form-container form');
const rentButtons = document.querySelectorAll('.service-container .box a');
const aboutBtn = document.querySelector('.about-btn');
const bookingsContainer = document.querySelector('.bookings-container');

// ====== MOBILE MENU TOGGLE ======
if (menuIcon && navbar) {
    menuIcon.addEventListener('click', () => {
        navbar.classList.toggle('active');
        menuIcon.classList.toggle('bx-menu');
        menuIcon.classList.toggle('bx-x');
    });
}

// ====== NAV LINKS SMOOTH SCROLL (WITH HEADER OFFSET) ======
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = targetSection.offsetTop - headerHeight - 10;

        window.scrollTo({
            top: targetPos < 0 ? 0 : targetPos,
            behavior: 'smooth'
        });

        // close mobile nav after click
        navbar.classList.remove('active');
        if (menuIcon) {
            menuIcon.classList.add('bx-menu');
            menuIcon.classList.remove('bx-x');
        }
    });
});

// ====== SCROLL EVENTS: ACTIVE LINK + HEADER SHADOW ======
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // header shadow
    if (header) {
        if (scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }

    // close nav on scroll (mobile)
    navbar.classList.remove('active');
    if (menuIcon) {
        menuIcon.classList.add('bx-menu');
        menuIcon.classList.remove('bx-x');
    }

    // set active nav link based on section
    sections.forEach(section => {
        const id = section.getAttribute('id');
        const sectionTop = section.offsetTop - (header ? header.offsetHeight + 40 : 120);
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollY >= sectionTop && scrollY < sectionBottom) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ====== FORM HANDLING (FAKE SEARCH) ======
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const locationInput = document.querySelector('#pickup-location');
        const dateInputs = form.querySelectorAll('input[type="date"]');

        const location = locationInput ? locationInput.value.trim() : '';
        const pickupDate = dateInputs[0] ? dateInputs[0].value : '';
        const returnDate = dateInputs[1] ? dateInputs[1].value : '';

        if (!location || !pickupDate || !returnDate) {
            alert('Please fill location, pick-up date and return date.');
            return;
        }

        if (pickupDate > returnDate) {
            alert('Return date cannot be before pick-up date.');
            return;
        }

        alert(
            `Searching cars in "${location}"\n` +
            `From: ${pickupDate}\nTo: ${returnDate}`
        );
    });
}

// ====== LOCAL STORAGE FOR BOOKINGS ======
const BOOKINGS_KEY = 'car_rental_bookings';

function loadBookings() {
    try {
        const data = localStorage.getItem(BOOKINGS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Error reading bookings from storage', err);
        return [];
    }
}

function saveBookings(bookings) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// ====== RENDER BOOKINGS ======
let bookings = loadBookings();
renderBookings();

function renderBookings() {
    if (!bookingsContainer) return;

    if (!bookings.length) {
        bookingsContainer.classList.add('empty');
        bookingsContainer.innerHTML = `
            <p class="empty-bookings-text">
                You haven't booked any cars yet. Browse our top deals and click
                <strong>"Rent Now"</strong> to add a booking here.
            </p>
        `;
        return;
    }

    bookingsContainer.classList.remove('empty');
    bookingsContainer.innerHTML = bookings.map(b => `
        <div class="booking-card" data-id="${b.id}">
            <div class="booking-card-img">
                <img src="${b.image}" alt="${b.name}">
            </div>
            <div class="booking-card-body">
                <h3>${b.name}</h3>
                <p>${b.price}</p>
                <p>Year: ${b.year || 'N/A'}</p>
                <div class="booking-meta">
                    <span>Booked on: ${b.bookedAt}</span>
                    <span>${b.duration || ''}</span>
                </div>
                <button class="booking-cancel-btn">Cancel Booking</button>
            </div>
        </div>
    `).join('');
}

// ====== ADD BOOKING WHEN "RENT NOW" CLICKED ======
rentButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const card = btn.closest('.box');
        if (!card) return;

        const imgEl = card.querySelector('.box-img img');
        const yearEl = card.querySelector('p');
        const nameEl = card.querySelector('h2');         // first h2 = car type/name
        const priceEl = card.querySelectorAll('h2')[1];  // second h2 = price

        const booking = {
            id: Date.now().toString(),
            image: imgEl ? imgEl.getAttribute('src') : '',
            year: yearEl ? yearEl.textContent.trim() : '',
            name: nameEl ? nameEl.textContent.trim() : 'Car',
            price: priceEl ? priceEl.textContent.trim() : '',
            bookedAt: new Date().toLocaleDateString(),
            duration: '/ month'
        };

        bookings.push(booking);
        saveBookings(bookings);
        renderBookings();

        // scroll to bookings to show result
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = bookingsContainer.parentElement.offsetTop - headerHeight - 10;
        window.scrollTo({
            top: targetPos < 0 ? 0 : targetPos,
            behavior: 'smooth'
        });
    });
});

// ====== CANCEL BOOKING (DELEGATED) ======
if (bookingsContainer) {
    bookingsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.booking-cancel-btn');
        if (!btn) return;

        const card = btn.closest('.booking-card');
        const id = card ? card.getAttribute('data-id') : null;
        if (!id) return;

        bookings = bookings.filter(b => b.id !== id);
        saveBookings(bookings);
        renderBookings();
    });
}

// ====== ABOUT BUTTON SCROLL (OPTIONAL) ======
if (aboutBtn) {
    aboutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const servicesSection = document.querySelector('#services');
        if (!servicesSection) return;

        const headerHeight = header ? header.offsetHeight : 0;
        const pos = servicesSection.offsetTop - headerHeight - 10;

        window.scrollTo({
            top: pos < 0 ? 0 : pos,
            behavior: 'smooth'
        });
    });
}
