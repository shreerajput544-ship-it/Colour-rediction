document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching Logic (Phone vs Email)
    const tabs = document.querySelectorAll('.tab-btn');
    const phoneGroup = document.getElementById('phone-group');
    const emailGroup = document.getElementById('email-group');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            
            // Add active class to clicked tab
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Toggle inputs
            if (tab.dataset.tab === 'phone') {
                phoneGroup.classList.remove('hidden');
                emailGroup.classList.add('hidden');
            } else {
                phoneGroup.classList.add('hidden');
                emailGroup.classList.remove('hidden');
            }
        });
    });

    // Login Logic
    const loginForm = document.getElementById('login-form');
    const phoneInput = document.getElementById('phone-input');
    const passwordInput = document.getElementById('password-input');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset errors
        phoneError.textContent = '';
        passwordError.textContent = '';

        const phone = phoneInput.value.trim();
        const password = passwordInput.value;

        // Check credentials against localStorage (saved by register.js)
        const users = JSON.parse(localStorage.getItem('winmore_users') || '[]');
        const validUser = users.find(u => u.phone === phone && u.password === password);

        if (validUser) {
            // Login Success: Save session and redirect
            localStorage.setItem('user', JSON.stringify({ phone: validUser.phone }));
            window.location.href = 'home.html';
        } else {
            // Login Failed
            const userExists = users.some(u => u.phone === phone);
            if (userExists) {
                passwordError.textContent = 'Incorrect password.';
            } else {
                phoneError.textContent = 'Account not found. Please register first.';
            }
        }
    });
});