/* ===================================
   ISAVOCADO SUPPLIERS - SCRIPT.JS
   Interactive Features & Animations
   =================================== */

// ========== DOM CONTENT LOADED ===========
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all features
    initSmoothScrolling();
    initActiveNavLinks();
    initMobileMenu();
    initScrollAnimations();
    initBackToTop();
    initFormValidation();
    
    console.log('Isavocado Suppliers website initialized successfully! 🥑');
});

// ========== SMOOTH SCROLLING ===========
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link, .btn[href^="#"], .footer-links a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Check if it's an anchor link
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Close mobile menu if open
                    const navMenu = document.getElementById('navMenu');
                    const hamburger = document.getElementById('hamburger');
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        hamburger.classList.remove('active');
                    }
                    
                    // Smooth scroll to section
                    const headerOffset = 80;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ========== ACTIVE NAV LINK HIGHLIGHTING ===========
function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // Handle hero section when at very top
        if (window.scrollY < 100) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#home') {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Update on scroll with throttling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(updateActiveLink);
    });
    
    // Initial call
    updateActiveLink();
}

// ========== MOBILE HAMBURGER MENU ===========
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
}

// ========== SCROLL ANIMATIONS (FADE IN) ===========
function initScrollAnimations() {
    // Add fade-in class to sections
    const sections = document.querySelectorAll('.about, .treatments, .benefits, .gallery, .booking');
    sections.forEach(section => {
        section.classList.add('fade-in-section');
    });
    
    // Add fade-in class to cards
    const cards = document.querySelectorAll('.treatment-card, .benefit-card, .gallery-item');
    cards.forEach(card => {
        card.classList.add('fade-in-section');
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all fade-in sections
    const fadeElements = document.querySelectorAll('.fade-in-section');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// ========== BACK TO TOP BUTTON ===========
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Scroll to top on click
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ========== FORM VALIDATION ===========
function initFormValidation() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const treatment = document.getElementById('treatment').value;
            const date = document.getElementById('date').value;
            const message = document.getElementById('message').value.trim();
            
            // Validation flags
            let isValid = true;
            let errorMessage = '';
            
            // Name validation
            if (name.length < 2) {
                isValid = false;
                errorMessage += 'Please enter a valid name.\n';
            }
            
            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                isValid = false;
                errorMessage += 'Please enter a valid email address.\n';
            }
            
            // Phone validation
            if (phone.length < 9) {
                isValid = false;
                errorMessage += 'Please enter a valid phone number.\n';
            }
            
            // Treatment selection validation
            if (!treatment) {
                isValid = false;
                errorMessage += 'Please select a treatment.\n';
            }
            
            // Date validation
            if (!date) {
                isValid = false;
                errorMessage += 'Please select a preferred date.\n';
            } else {
                // Check if date is in the future
                const selectedDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    isValid = false;
                    errorMessage += 'Please select a future date.\n';
                }
            }
            
            // If valid, show success message
            if (isValid) {
                // Show success alert
                alert(`Thank you, ${name}! 🥑\n\nYour booking request has been received.\n\nTreatment: ${getTreatmentName(treatment)}\nDate: ${formatDate(date)}\n\nWe'll contact you at ${email} or ${phone} within 24 hours to confirm your appointment.\n\nWe look forward to welcoming you to Isavocado Suppliers!`);
                
                // Reset form
                bookingForm.reset();
                
                // In a real application, you would send this data to a server
                console.log('Booking submitted:', {
                    name,
                    email,
                    phone,
                    treatment,
                    date,
                    message
                });
            } else {
                // Show error alert
                alert('Please correct the following errors:\n\n' + errorMessage);
            }
        });
        
        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailPattern.test(email)) {
                    alert(`Thank you for subscribing! 🥑\n\nWe'll send wellness tips and exclusive offers to ${email}`);
                    emailInput.value = '';
                } else {
                    alert('Please enter a valid email address.');
                }
            });
        }
    }
}

// ========== HELPER FUNCTIONS ===========

// Get treatment name from value
function getTreatmentName(value) {
    const treatments = {
        'avocado-glow-facial': 'Avocado Glow Facial',
        'body-scrub-wrap': 'Body Scrub & Hydration Wrap',
        'oil-massage': 'Deep Tissue Avocado Oil Massage',
        'foot-ritual': 'Rejuvenating Avocado Foot Ritual',
        'couples-package': 'Couples Avocado Bliss Package',
        'anti-aging': 'Anti-Aging Avocado Renewal'
    };
    return treatments[value] || value;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ========== STICKY HEADER ON SCROLL ===========
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }
});

// ========== GALLERY LIGHTBOX (SIMPLE VERSION) ===========
// Add click events to gallery items for a simple zoom effect
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const overlay = this.querySelector('.gallery-overlay p');
            
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                cursor: pointer;
                padding: 20px;
            `;
            
            const lightboxImg = document.createElement('img');
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
            `;
            
            lightbox.appendChild(lightboxImg);
            document.body.appendChild(lightbox);
            
            // Fade in animation
            setTimeout(() => {
                lightbox.style.opacity = '1';
            }, 10);
            
            // Close on click
            lightbox.addEventListener('click', function() {
                this.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(this);
                }, 300);
            });
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Restore scroll on close
            lightbox.addEventListener('click', function() {
                document.body.style.overflow = '';
            });
        });
    });
});

// ========== PRELOAD CRITICAL IMAGES ===========
// Preload hero image for better performance
window.addEventListener('load', function() {
    const heroImage = new Image();
    heroImage.src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80';
});

// ========== SET MINIMUM DATE FOR BOOKING ===========
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
    }
});

// ========== PERFORMANCE OPTIMIZATION ===========
// Lazy loading for images (already in HTML with loading="lazy")
// Additional optimization: only load images when they're about to enter viewport

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Already using native lazy loading, this is just a fallback
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    // Observe images with data-src attribute (if any)
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========== CONSOLE EASTER EGG ===========
console.log(`
%c🥑 Isavocado Suppliers 🥑
%cExperience the power of Tanzania's finest avocados
%cWebsite crafted with care using vanilla HTML, CSS, and JavaScript
`,
'color: #4CAF50; font-size: 24px; font-weight: bold;',
'color: #1a3c34; font-size: 14px;',
'color: #666; font-size: 12px; font-style: italic;'
);
