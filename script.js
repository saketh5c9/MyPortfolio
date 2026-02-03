// Three.js Background Animation
let scene, camera, renderer, particles, starField;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeJS() {
    // Scene Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create Particle System
    createParticles();
    
    // Create Star Field
    createStarField();
    
    // Create Connection Lines
    createConnectionLines();

    // Event Listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);

    // Start Animation
    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorPalette = [
        { r: 0, g: 212 / 255, b: 255 / 255 },     // Primary cyan
        { r: 78 / 255, g: 205 / 255, b: 196 / 255 }, // Teal
        { r: 255 / 255, g: 107 / 255, b: 107 / 255 }, // Coral
        { r: 100 / 255, g: 228 / 255, b: 255 / 255 }  // Light cyan
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Position - spread in a sphere-like distribution
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = (Math.random() - 0.5) * 100;
        positions[i3 + 2] = (Math.random() - 0.5) * 50;
        
        // Color - pick from palette with slight variation
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r + (Math.random() - 0.5) * 0.1;
        colors[i3 + 1] = color.g + (Math.random() - 0.5) * 0.1;
        colors[i3 + 2] = color.b + (Math.random() - 0.5) * 0.1;
        
        // Size
        sizes[i] = Math.random() * 2 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const starCount = 500;
    
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.08,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    
    starField = new THREE.Points(geometry, material);
    scene.add(starField);
}

function createConnectionLines() {
    // Create some floating geometric shapes
    const shapes = new THREE.Group();
    
    // Floating rings
    for (let i = 0; i < 5; i++) {
        const geometry = new THREE.RingGeometry(2 + i, 2.1 + i, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.1 - i * 0.015
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20 - 10
        );
        ring.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            0
        );
        ring.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            floatSpeed: Math.random() * 0.005 + 0.002,
            floatOffset: Math.random() * Math.PI * 2
        };
        shapes.add(ring);
    }
    
    scene.add(shapes);
    window.floatingShapes = shapes;
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.02;
    mouseY = (event.clientY - windowHalfY) * 0.02;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.0005;
    
    // Animate particles
    if (particles) {
        particles.rotation.x += 0.0003;
        particles.rotation.y += 0.0005;
        
        // Subtle wave motion
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i] * 0.1) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate star field
    if (starField) {
        starField.rotation.y += 0.0002;
    }
    
    // Animate floating shapes
    if (window.floatingShapes) {
        window.floatingShapes.children.forEach((shape, index) => {
            shape.rotation.x += shape.userData.rotationSpeed;
            shape.rotation.y += shape.userData.rotationSpeed * 0.5;
            shape.position.y += Math.sin(time * shape.userData.floatSpeed * 100 + shape.userData.floatOffset) * 0.02;
        });
    }
    
    // Smooth camera movement based on mouse
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Custom Cursor
function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursorDot || !cursorOutline) return;
    
    let cursorX = 0, cursorY = 0;
    let outlineX = 0, outlineY = 0;
    
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });
    
    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-item, .contact-card, .exp-tab');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('hover');
        });
    });
    
    function animateCursor() {
        // Dot follows cursor exactly
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
        
        // Outline follows with delay
        outlineX += (cursorX - outlineX) * 0.15;
        outlineY += (cursorY - outlineY) * 0.15;
        cursorOutline.style.left = outlineX + 'px';
        cursorOutline.style.top = outlineY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// Experience Tabs
function initExperienceTabs() {
    const tabs = document.querySelectorAll('.exp-tab');
    const panels = document.querySelectorAll('.exp-panel');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active to clicked
            tab.classList.add('active');
            panels[index].classList.add('active');
        });
    });
}

// Mobile Navigation
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!hamburger) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// GSAP Scroll Animations
function initScrollAnimations() {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate sections on scroll
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        gsap.from(section.querySelectorAll('.section-header, .about-content, .experience-grid, .projects-grid, .skills-container, .contact-content'), {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2
        });
    });
    
    // Animate stats
    gsap.from('.stat-card', {
        scrollTrigger: {
            trigger: '.about-stats',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15
    });
    
    // Animate project cards
    gsap.from('.project-card', {
        scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15
    });
    
    // Animate skill categories
    gsap.from('.skill-category', {
        scrollTrigger: {
            trigger: '.skills-container',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1
    });
    
    // Parallax effect for gradient orbs
    gsap.to('.orb-1', {
        y: -100,
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        }
    });
    
    gsap.to('.orb-2', {
        y: 100,
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        }
    });
}

// Smooth Scroll for Navigation Links
function initSmoothScroll() {
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
}

// Typing Effect for Hero
function initTypingEffect() {
    const roles = ['AI Enthusiast', 'ML Explorer', 'Tech Innovator', 'Problem Solver'];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    const roleElement = document.querySelector('.role-text');
    if (!roleElement || !roleElement.dataset.typing) return;
    
    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            roleElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            roleElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Pause before new word
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // type(); // Uncomment to enable typing effect
}

// Counter Animation for Stats
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-content h3');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent);
                const suffix = counter.textContent.replace(/[0-9]/g, '');
                let current = 0;
                const increment = target / 50;
                const duration = 2000;
                const stepTime = duration / 50;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.floor(current) + suffix;
                        setTimeout(updateCounter, stepTime);
                    } else {
                        counter.textContent = target + suffix;
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

// Intersection Observer for Reveal Animations
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.project-card, .skill-category, .contact-card, .stat-card');
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        revealObserver.observe(el);
    });
}

// Project Tabs Functionality
function initProjectTabs() {
    const tabs = document.querySelectorAll('.project-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js
    initThreeJS();
    
    // Initialize Custom Cursor
    initCustomCursor();
    
    // Initialize Experience Tabs
    initExperienceTabs();
    
    // Initialize Project Tabs
    initProjectTabs();
    
    // Initialize Mobile Navigation
    initMobileNav();
    
    // Initialize Navbar Scroll Effect
    initNavbarScroll();
    
    // Initialize Smooth Scroll
    initSmoothScroll();
    
    // Initialize GSAP Animations (if available)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        initScrollAnimations();
    }
    
    // Initialize Reveal Animations
    initRevealAnimations();
    
    // Initialize Counter Animation
    initCounterAnimation();
    
    // Console Easter Egg
    console.log('%c🚀 Welcome to Saketh\'s Portfolio!', 'font-size: 20px; font-weight: bold; color: #00d4ff;');
    console.log('%cInterested in AI & ML? Let\'s connect!', 'font-size: 14px; color: #4ecdc4;');
});

// Preloader (optional)
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
