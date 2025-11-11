// Store Vanta effect instances
let vantaNetEffect = null;
let vantaRingsEffect = null;

// Check saved theme BEFORE initializing Vanta
const savedTheme = localStorage.getItem('theme');
const isLightMode = savedTheme === 'light';

// Set initial colors based on saved theme
const initialBgColor = isLightMode ? 0xf8fafc : 0x0a0e27;

// Vanta.js NET background for entire page
document.addEventListener('DOMContentLoaded', function() {
  if (window.VANTA && window.VANTA.NET) {
    vantaNetEffect = VANTA.NET({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x6366f1, // UI primary color
      backgroundColor: initialBgColor, // Use saved theme color
      points: 10,
      maxDistance: 20,
      spacing: 15,
      showDots: true
    });
  }
  
  // Vanta.js Rings background for hero section
  if (window.VANTA && window.VANTA.RINGS) {
    vantaRingsEffect = VANTA.RINGS({
      el: "#hero-vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x6366f1, // UI primary color
      backgroundColor: initialBgColor, // Use saved theme color
      backgroundAlpha: 1
    });
  }
});

// Skills data
const skills = [
  { name: 'JavaScript', src: 'Images/javascript.png' },
  { name: 'Python', src: 'Images/python.png' },
  { name: 'HTML', src: 'Images/html.png' },
  { name: 'Java', src: 'Images/java.png' },
  { name: 'SQL', src: 'Images/sql.png' },
  { name: 'CSS', src: 'Images/css.png' }
];

console.log('Skills array loaded with', skills.length, 'items:', skills.map(s => s.name));

// Populate right sidebar carousels
function populateRightCarousel(elementId, skillsArray) {
  const carousel = document.getElementById(elementId);
  if (!carousel) {
    console.error('Carousel element not found:', elementId);
    return;
  }
  
  // Create many copies to ensure smooth infinite scroll
  const multiplied = [];
  for (let i = 0; i < 6; i++) {
    multiplied.push(...skillsArray);
  }
  
  console.log('Populating carousel', elementId, 'with', multiplied.length, 'items');
  
  multiplied.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card-right';
    
    const img = document.createElement('img');
    img.src = skill.src;
    img.alt = skill.name;
    img.className = 'skill-icon-right';
    img.onload = function() {
      console.log('Loaded:', skill.name);
    };
    img.onerror = function() {
      console.error('Failed to load image:', skill.src);
    };
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'skill-name-right';
    nameDiv.textContent = skill.name;
    
    card.appendChild(img);
    card.appendChild(nameDiv);
    carousel.appendChild(card);
  });
  
  console.log('Total cards in', elementId, ':', carousel.children.length);
}

populateRightCarousel('carouselRight1', skills);
populateRightCarousel('carouselRight2', skills);

// Current date
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const currentDateElement = document.getElementById('currentDate');
if (currentDateElement) {
  currentDateElement.textContent = new Date().toLocaleDateString('en-US', options);
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved theme (already checked earlier, just apply the class if needed)
if (isLightMode) {
  body.classList.add('light-mode');
  themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i><span>Dark Mode</span>';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  
  if (body.classList.contains('light-mode')) {
    themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i><span>Dark Mode</span>';
    localStorage.setItem('theme', 'light');
    
    // Update Vanta.js colors for light mode
    if (vantaNetEffect) {
      vantaNetEffect.setOptions({
        color: 0x6366f1,
        backgroundColor: 0xf8fafc
      });
    }
    if (vantaRingsEffect) {
      vantaRingsEffect.setOptions({
        color: 0x6366f1,
        backgroundColor: 0xf8fafc
      });
    }
  } else {
    themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i><span>Light Mode</span>';
    localStorage.setItem('theme', 'dark');
    
    // Update Vanta.js colors for dark mode
    if (vantaNetEffect) {
      vantaNetEffect.setOptions({
        color: 0x6366f1,
        backgroundColor: 0x0a0e27
      });
    }
    if (vantaRingsEffect) {
      vantaRingsEffect.setOptions({
        color: 0x6366f1,
        backgroundColor: 0x0a0e27
      });
    }
  }
});

// Mobile menu toggle
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');

mobileToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Close sidebar when clicking on a link (mobile)
const navLinks = document.querySelectorAll('.nav-item-custom');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 991) {
      sidebar.classList.remove('active');
    }
  });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Expertise dropdown toggles
document.querySelectorAll('.expertise-header').forEach(header => {
  header.addEventListener('click', function() {
    const dropdown = this.parentElement;
    const wasOpen = dropdown.classList.contains('open');
    
    // Close all dropdowns
    document.querySelectorAll('.expertise-dropdown').forEach(d => {
      d.classList.remove('open');
    });
    
    // Toggle current dropdown
    if (!wasOpen) {
      dropdown.classList.add('open');
    }
  });
});

// Fade in on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
