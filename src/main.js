import './style.css';
import { createIcons, icons } from 'lucide';
import ScrollReveal from 'scrollreveal';

// Initialize Lucide icons
createIcons({
    icons
});

// ===== WEATHER WIDGET =====
async function updateWeather() {
    const weatherWidget = document.getElementById('weather-widget');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherIcon = weatherWidget?.querySelector('i');

    if (!weatherWidget || !weatherTemp) return;

    try {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Using Open-Meteo API (free, no API key needed)
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        const temp = Math.round(data.current_weather.temperature);
                        const weatherCode = data.current_weather.weathercode;

                        weatherTemp.textContent = `${temp}°C`;

                        // Update icon based on weather code
                        let iconName = 'cloud';
                        if (weatherCode === 0) iconName = 'sun';
                        else if (weatherCode <= 3) iconName = 'cloud';
                        else if (weatherCode <= 67) iconName = 'cloud-rain';
                        else if (weatherCode <= 77) iconName = 'cloud-snow';
                        else iconName = 'cloud-drizzle';

                        weatherIcon?.setAttribute('data-lucide', iconName);
                        createIcons({ icons });
                    }
                },
                () => {
                    // Fallback if location denied - use default location (Delhi)
                    fetchWeatherByCoords(28.6139, 77.2090);
                }
            );
        } else {
            // Fallback if geolocation not supported
            fetchWeatherByCoords(28.6139, 77.2090);
        }
    } catch (error) {
        console.log('Weather fetch error:', error);
        weatherTemp.textContent = '25°C'; // Fallback
    }
}

async function fetchWeatherByCoords(lat, lon) {
    const weatherTemp = document.getElementById('weather-temp');
    const weatherWidget = document.getElementById('weather-widget');
    const weatherIcon = weatherWidget?.querySelector('i');

    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );

        if (response.ok) {
            const data = await response.json();
            const temp = Math.round(data.current_weather.temperature);
            const weatherCode = data.current_weather.weathercode;

            weatherTemp.textContent = `${temp}°C`;

            let iconName = 'cloud';
            if (weatherCode === 0) iconName = 'sun';
            else if (weatherCode <= 3) iconName = 'cloud';
            else if (weatherCode <= 67) iconName = 'cloud-rain';
            else if (weatherCode <= 77) iconName = 'cloud-snow';
            else iconName = 'cloud-drizzle';

            weatherIcon?.setAttribute('data-lucide', iconName);
            createIcons({ icons });
        }
    } catch (error) {
        console.log('Weather fetch error:', error);
    }
}

// Update weather on load
updateWeather();
// Refresh weather every 30 minutes
setInterval(updateWeather, 1800000);

// ===== DYNAMIC GREETING =====
function updateGreeting() {
    const greetingEl = document.getElementById('dynamic-greeting');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let greeting = '';

    if (hour >= 5 && hour < 12) {
        greeting = '☀️ Good morning!';
    } else if (hour >= 12 && hour < 17) {
        greeting = '👋 Good afternoon!';
    } else if (hour >= 17 && hour < 22) {
        greeting = '🌆 Good evening!';
    } else {
        greeting = '🌙 Good night!';
    }

    greetingEl.textContent = greeting;
}
updateGreeting();

// ===== SCROLLSPY - HIGHLIGHT ACTIVE NAV LINK =====
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const sections = Array.from(navLinks).map(link => {
    const href = link.getAttribute('href');
    return document.querySelector(href);
}).filter(Boolean);

let currentSection = '';

function updateActiveLink() {
    // Find current section
    let current = '';
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = '#' + section.getAttribute('id');
        }
    });

    // Update active link styling
    if (current && current !== currentSection) {
        currentSection = current;

        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active-nav-link');
        });

        // Add active class to current link
        const activeLink = document.querySelector(`nav a[href="${current}"]`);
        if (activeLink) {
            activeLink.classList.add('active-nav-link');
        }
    }
}

// Throttle scroll events
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateActiveLink();
            ticking = false;
        });
        ticking = true;
    }
});

// Initial update
setTimeout(updateActiveLink, 500);

// ===== 3D CARD POP EFFECT ON SCROLL =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('card-pop');
            // Optionally unobserve after animation
            cardObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.card-monochrome').forEach(card => {
    cardObserver.observe(card);
});

// Also observe captures grid items
document.querySelectorAll('#captures .grid > div').forEach(item => {
    cardObserver.observe(item);
});

// ===== RIPPLE EFFECT =====
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Add ripple to all buttons and links
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', createRipple);
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
    <i data-lucide="check-circle" class="w-5 h-5"></i>
    <span>${message}</span>
  `;

    document.body.appendChild(toast);
    createIcons({ icons });

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== CONTACT FORM =====
const contactBtn = document.querySelector('a[href="mailto:hello@example.com"]');
if (contactBtn) {
    contactBtn.addEventListener('click', (e) => {
        showToast('📧 Opening email client...');
    });
}

// ===== ANIMATED ICONS =====
document.querySelectorAll('[data-lucide]').forEach(icon => {
    icon.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.2) rotate(10deg)';
        this.style.transition = 'transform 0.3s ease';
    });
    icon.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// ===== SCROLL REVEAL =====
const sr = ScrollReveal({
    origin: 'bottom',
    distance: '30px',
    duration: 1000,
    delay: 200,
    reset: false
});

sr.reveal('#dynamic-greeting', { origin: 'left', distance: '20px' });
sr.reveal('h1', { origin: 'left', distance: '50px', delay: 300 });
sr.reveal('.polaroid', { origin: 'right', delay: 400 });
sr.reveal('.sticky-note', { origin: 'bottom', delay: 600 });
sr.reveal('.card-monochrome', { interval: 150 });
sr.reveal('#story .flex', { interval: 200 });
sr.reveal('#captures .grid > div', { interval: 100 });

// ===== LIVE TIME BADGE =====
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes} IST`;

    const timeBadge = document.getElementById('time-badge');
    if (timeBadge) {
        timeBadge.textContent = timeString;
    }
}

updateTime();
setInterval(updateTime, 60000);

// ===== MOBILE MENU =====
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.createElement('div');
mobileMenu.className = 'md:hidden hidden bg-white/95 backdrop-blur-md mt-4 rounded-2xl border border-gray-200 overflow-hidden';
mobileMenu.innerHTML = `
  <div class="px-4 py-4 space-y-2">
    <a href="#work" class="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Work</a>
    <a href="#story" class="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Story</a>
    <a href="#captures" class="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Captures</a>
    <a href="#contact" class="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Contact</a>
    <div class="pt-2 border-t border-gray-200">
      <a href="#contact" class="block px-4 py-2 bg-gray-900 text-white text-center rounded-lg hover:bg-gray-800 transition-colors">Get in Touch</a>
    </div>
  </div>
`;

const navContainerParent = document.querySelector('nav > div');
if (navContainerParent) {
    navContainerParent.appendChild(mobileMenu);
}

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const icon = menuBtn.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.setAttribute('data-lucide', 'menu');
        } else {
            icon.setAttribute('data-lucide', 'x');
        }
        createIcons({ icons });
    });
}

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        const icon = menuBtn?.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', 'menu');
            createIcons({ icons });
        }
    });
});

console.log('Portfolio initialized - All features loaded! ✨');
