// Check login state
function checkLoginState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const loginBtn = document.querySelector('.login-btn');
    
    if (currentUser.isLoggedIn) {
        // Update login button to show user info and logout option
        if (currentUser.authProvider === 'google' && currentUser.picture) {
            loginBtn.innerHTML = `
                <img src="${currentUser.picture}" alt="${currentUser.name}" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">
                <span>${currentUser.name}</span>
            `;
        } else {
            loginBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${currentUser.name}</span>
            `;
        }
        loginBtn.href = '#';
        
        // Add logout functionality
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
        
        // Show course progress for all courses
        const courses = ['web-security', 'cryptography', 'network-security'];
        courses.forEach(courseId => {
            const progress = loadCourseProgress(courseId);
            if (progress) {
                updateLearningPathProgress(courseId, progress);
            }
        });
    } else {
        // Ensure login button shows "Login"
        loginBtn.innerHTML = 'Login';
        loginBtn.href = 'login.html';
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Course filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const courseCards = document.querySelectorAll('.course-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        courseCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-level') === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Course progress tracking
const startCourseButtons = document.querySelectorAll('.start-course-btn');
startCourseButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Check if user is logged in
        if (!currentUser.isLoggedIn) {
            e.preventDefault();
            window.location.href = 'login.html';
            return;
        }
        
        const courseId = this.getAttribute('data-course');
        localStorage.setItem('currentCourse', courseId);
    });
});

// Learning path progress tracking
function updateLearningPathProgress(courseId, progress) {
    // Map courses to their difficulty levels
    const courseLevels = {
        'web-security': 'beginner',
        'cryptography': 'intermediate',
        'network-security': 'advanced'
    };
    
    const level = courseLevels[courseId];
    if (level) {
        const pathCard = document.querySelector(`.path-card.${level}`);
        if (pathCard) {
            const progressBar = pathCard.querySelector('.progress');
            const progressText = pathCard.querySelector('.progress-text');
            
            if (progressBar && progressText) {
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}% Complete`;
            }
        }
    }
}

// Save course progress
function saveCourseProgress(courseId, progress) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.isLoggedIn) {
        const userProgress = JSON.parse(localStorage.getItem(`progress_${currentUser.username}`) || '{}');
        userProgress[courseId] = progress;
        localStorage.setItem(`progress_${currentUser.username}`, JSON.stringify(userProgress));
        updateLearningPathProgress(courseId, progress);
    }
}

// Load course progress
function loadCourseProgress(courseId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.isLoggedIn) {
        const userProgress = JSON.parse(localStorage.getItem(`progress_${currentUser.username}`) || '{}');
        return userProgress[courseId] || 0;
    }
    return 0;
}

// Add scroll-based animations for course cards
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to course cards
document.querySelectorAll('.course-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
}); 