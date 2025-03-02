// Base URL for GitHub Pages
const baseUrl = '/Hack-academy';

// Check login state and redirect if not logged in
function checkLoginState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.isLoggedIn) {
        window.location.href = `${baseUrl}/login.html`;
        return;
    }
    
    // Update login button
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.innerHTML = `
        <i class="fas fa-user"></i>
        <span>${currentUser.name}</span>
    `;
    
    // Add logout functionality
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = `${baseUrl}/index.html`;
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', (event) => {
    checkLoginState();
    hljs.highlightAll();
    
    // Load course progress
    const progress = loadCourseProgress();
    updateProgressUI(progress);
});

// Quiz functionality
const quiz = document.querySelector('.quiz');
if (quiz) {
    const submitButton = quiz.querySelector('.submit-quiz');
    const questions = quiz.querySelectorAll('.question');

    submitButton.addEventListener('click', () => {
        let score = 0;
        let totalQuestions = questions.length;
        
        questions.forEach(question => {
            const selectedOption = question.querySelector('input[type="radio"]:checked');
            const feedback = question.querySelector('.feedback');
            const correctAnswer = question.getAttribute('data-correct');
            
            if (selectedOption) {
                if (selectedOption.value === correctAnswer) {
                    score++;
                    feedback.textContent = '✓ Correct!';
                    feedback.className = 'feedback correct';
                    feedback.style.display = 'block';
                } else {
                    feedback.textContent = '✗ Incorrect';
                    feedback.className = 'feedback incorrect';
                    feedback.style.display = 'block';
                }
            } else {
                feedback.textContent = 'Please select an answer.';
                feedback.className = 'feedback incorrect';
                feedback.style.display = 'block';
            }
        });
        
        // Update progress if score is good enough
        if (score / totalQuestions >= 0.7) { // 70% passing grade
            const currentProgress = loadCourseProgress('cryptography');
            const newProgress = Math.min(currentProgress + 10, 100); // Each lesson is worth 10%
            saveCourseProgress('cryptography', newProgress);
            updateProgressUI(newProgress);
            
            // Update learning path progress
            updateLearningPathProgress('cryptography', newProgress);
            
            // Mark current lesson as completed
            const currentLesson = document.querySelector('.lesson-list li.active .lesson-check');
            if (currentLesson) {
                currentLesson.classList.add('completed');
                currentLesson.innerHTML = '<i class="fas fa-check"></i>';
            }
            
            // Enable next lesson button
            const nextButton = document.querySelector('.nav-btn.next');
            if (nextButton) {
                nextButton.disabled = false;
            }
        }
    });
}

// Lesson navigation
document.querySelectorAll('.lesson-list li').forEach((lesson, index) => {
    lesson.addEventListener('click', () => {
        const progress = loadCourseProgress();
        const lessonNumber = index + 1;
        
        // Only allow access to lessons if previous lessons are completed or it's the next lesson
        if (progress >= (index * 10) || lessonNumber === getCurrentLessonNumber()) {
            window.location.href = `${baseUrl}/courses/cryptography/lessons/lesson${lessonNumber}.html`;
        } else {
            alert('Please complete the previous lessons first!');
        }
    });
});

// Next/Previous lesson navigation
const nextButton = document.querySelector('.nav-btn.next');
const prevButton = document.querySelector('.nav-btn.prev');

if (nextButton) {
    nextButton.addEventListener('click', () => {
        const currentLesson = getCurrentLessonNumber();
        if (currentLesson < 10) { // Total number of lessons
            const currentPath = window.location.pathname;
            const isInLessonsDir = currentPath.includes('/lessons/');
            if (isInLessonsDir) {
                window.location.href = `${baseUrl}/courses/cryptography/lessons/lesson${currentLesson + 1}.html`;
            } else {
                window.location.href = `${baseUrl}/courses/cryptography/lessons/lesson${currentLesson + 1}.html`;
            }
        }
    });
}

if (prevButton) {
    prevButton.addEventListener('click', () => {
        const currentLesson = getCurrentLessonNumber();
        if (currentLesson > 1) {
            const currentPath = window.location.pathname;
            const isInLessonsDir = currentPath.includes('/lessons/');
            if (isInLessonsDir) {
                window.location.href = `${baseUrl}/courses/cryptography/lessons/lesson${currentLesson - 1}.html`;
            } else {
                window.location.href = `${baseUrl}/courses/cryptography/lessons/lesson${currentLesson - 1}.html`;
            }
        }
    });
}

// Helper functions
function getCurrentLessonNumber() {
    const path = window.location.pathname;
    const match = path.match(/lesson(\d+)\.html$/);
    return match ? parseInt(match[1]) : 1;
}

function loadCourseProgress() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.isLoggedIn) {
        const userProgress = JSON.parse(localStorage.getItem(`progress_${currentUser.email}`) || '{}');
        return userProgress['cryptography'] || 0;
    }
    return 0;
}

function saveCourseProgress(progress) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.isLoggedIn) {
        const userProgress = JSON.parse(localStorage.getItem(`progress_${currentUser.email}`) || '{}');
        userProgress['cryptography'] = progress;
        localStorage.setItem(`progress_${currentUser.email}`, JSON.stringify(userProgress));

        // If user is authenticated with Google, sync to Firestore
        if (currentUser.authProvider === 'google') {
            const db = firebase.firestore();
            db.collection('userProgress')
                .doc(currentUser.email)
                .set(userProgress, { merge: true })
                .catch((error) => {
                    console.error("Error saving progress to cloud:", error);
                });
        }
    }
}

function updateProgressUI(progress) {
    const progressBar = document.querySelector('.course-progress .progress');
    const progressText = document.querySelector('.course-progress .progress-text');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}% Complete`;
    }
    
    // Update lesson checkmarks
    const lessons = document.querySelectorAll('.lesson-list li');
    lessons.forEach((lesson, index) => {
        const checkmark = lesson.querySelector('.lesson-check');
        if (checkmark && progress >= ((index + 1) * 10)) {
            checkmark.classList.add('completed');
            checkmark.innerHTML = '<i class="fas fa-check"></i>';
        }
    });
    
    // Update navigation buttons
    const currentLesson = getCurrentLessonNumber();
    if (prevButton) {
        prevButton.disabled = currentLesson === 1;
    }
    if (nextButton) {
        nextButton.disabled = progress < (currentLesson * 10);
    }
}

// Interactive code examples
document.querySelectorAll('.code-example').forEach(example => {
    const code = example.querySelector('code');
    if (code) {
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        example.querySelector('pre').appendChild(copyButton);
        
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(code.textContent.trim());
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        });
    }
}); 