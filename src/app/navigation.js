// Smooth Navigation and Scroll Effects
document.addEventListener('DOMContentLoaded', function() {
    // Get navigation links and sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const header = document.querySelector('.premium-header');
    
    // Create scroll indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    document.body.appendChild(scrollIndicator);

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active navigation on scroll
    function updateActiveNav() {
        const scrollPosition = window.scrollY + header.offsetHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section link
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    // Header scroll effect
    function handleHeaderScroll() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Scroll animations for sections
    function animateOnScroll() {
        const animatedElements = document.querySelectorAll('.section-animate');
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    }

    // Update scroll indicator
    function updateScrollIndicator() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollIndicator.style.width = scrollPercent + '%';
    }

    // Add scroll event listeners
    window.addEventListener('scroll', function() {
        updateActiveNav();
        handleHeaderScroll();
        animateOnScroll();
        updateScrollIndicator();
    });

    // Initialize on page load
    updateActiveNav();
    handleHeaderScroll();
    animateOnScroll();

    // Add animation classes to sections
    sections.forEach(section => {
        section.classList.add('section-animate');
    });

    // Smooth scroll for hero button
    const heroBtn = document.querySelector('.hero-btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', function() {
            const demoSection = document.getElementById('demo');
            if (demoSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = demoSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Progress bar animation on scroll
    const progressBars = document.querySelectorAll('.tech-progress');
    
    function animateProgressBars() {
        progressBars.forEach(bar => {
            const barTop = bar.getBoundingClientRect().top;
            
            if (barTop < window.innerHeight - 100) {
                bar.style.animationPlayState = 'running';
            }
        });
    }

    window.addEventListener('scroll', animateProgressBars);
    animateProgressBars(); // Initial check
});