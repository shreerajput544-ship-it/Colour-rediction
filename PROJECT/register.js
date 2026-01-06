// Simulated OTP storage for demo
let pendingRegistrations = {};

document.addEventListener('DOMContentLoaded', function () {
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const verifyOtpBtn = document.getElementById('verify-otp-btn');
  const backBtn = document.getElementById('back-btn');
  const regPhone = document.getElementById('reg-phone');
  const regPassword = document.getElementById('reg-password');
  const regConfirmPassword = document.getElementById('reg-confirm-password');
  const regOtp = document.getElementById('reg-otp');
  
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');

  const phoneError = document.getElementById('reg-phone-error');
  const passwordError = document.getElementById('reg-password-error');
  const confirmError = document.getElementById('reg-confirm-error');
  const otpError = document.getElementById('reg-otp-error');

  // Password validation rules
  const passwordRules = {
    length: /^.{8,}$/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
  };

  // Real-time password validation display
  regPassword.addEventListener('input', () => {
    const pwd = regPassword.value;
    updatePasswordRule('length', passwordRules.length.test(pwd));
    updatePasswordRule('uppercase', passwordRules.uppercase.test(pwd));
    updatePasswordRule('lowercase', passwordRules.lowercase.test(pwd));
    updatePasswordRule('number', passwordRules.number.test(pwd));
    updatePasswordRule('special', passwordRules.special.test(pwd));
  });

  function updatePasswordRule(rule, valid) {
    const elem = document.getElementById('rule-' + rule);
    if (valid) {
      elem.textContent = '✓ ' + elem.textContent.substring(2);
      elem.style.color = 'green';
    } else {
      elem.textContent = '✗ ' + elem.textContent.substring(2);
      elem.style.color = 'red';
    }
  }

  function validatePassword(pwd) {
    return Object.values(passwordRules).every(rule => rule.test(pwd));
  }

  // Step 1: Send OTP
  sendOtpBtn.addEventListener('click', () => {
    phoneError.textContent = '';
    passwordError.textContent = '';
    confirmError.textContent = '';

    const phone = regPhone.value.trim();
    const password = regPassword.value;
    const confirmPassword = regConfirmPassword.value;

    let valid = true;

    // Phone validation
    if (!/^\d{10}$/.test(phone)) {
      phoneError.textContent = 'Enter a valid 10-digit phone number.';
      valid = false;
    }

    // Password validation
    if (!validatePassword(password)) {
      passwordError.textContent = 'Password must meet all requirements above.';
      valid = false;
    }

    // Confirm password match
    if (password !== confirmPassword) {
      confirmError.textContent = 'Passwords do not match.';
      valid = false;
    }

    if (!valid) return;

    // Generate random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 20000; // 20 seconds
    pendingRegistrations[phone] = {
      phone,
      password,
      otp,
      expiresAt
    };

    console.log(`✓ OTP sent to +91${phone}: ${otp} (expires in 20 seconds)`);
    alert(`✓ OTP sent to +91${phone}\n\nOTP: ${otp}\n\n(Valid for 20 seconds only)`);

    // Move to Step 2
    document.getElementById('otp-phone-display').textContent = `+91${phone}`;
    step1.classList.add('hidden');
    step2.classList.remove('hidden');

    // Start OTP timer
    startOtpTimer();
  });

  // Step 2: Verify OTP
  verifyOtpBtn.addEventListener('click', () => {
    otpError.textContent = '';

    const phone = regPhone.value.trim();
    const otp = regOtp.value.trim();
    const reg = pendingRegistrations[phone];

    if (!reg) {
      otpError.textContent = 'Registration session expired. Start again.';
      return;
    }

    if (Date.now() > reg.expiresAt) {
      otpError.textContent = 'OTP expired. Request a new one.';
      delete pendingRegistrations[phone];
      return;
    }

    if (otp !== reg.otp) {
      otpError.textContent = 'Incorrect OTP. Try again.';
      return;
    }

    // OTP verified - save user and redirect to home
    saveUser(phone, reg.password);
    delete pendingRegistrations[phone];

    // mark user as logged in (store phone as identifier)
    localStorage.setItem('user', JSON.stringify({ phone: phone }));

    // Redirect to home page
    window.location.href = 'home.html';
  });

  // Back button
  backBtn.addEventListener('click', () => {
    regOtp.value = '';
    otpError.textContent = '';
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
    clearOtpTimer();
  });

  // OTP Timer
  let timerInterval = null;
  function startOtpTimer() {
    let remaining = 20;
    const timerElem = document.getElementById('timer');
    timerInterval = setInterval(() => {
      remaining--;
      timerElem.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(timerInterval);
        otpError.textContent = 'OTP expired. Go back and request a new one.';
        verifyOtpBtn.disabled = true;
      }
    }, 1000);
  }

  function clearOtpTimer() {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('timer').textContent = '20';
  }

  // Save user to localStorage (simulated persistent storage)
  function saveUser(phone, password) {
    const users = JSON.parse(localStorage.getItem('winmore_users') || '[]');
    users.push({ phone, password, createdAt: new Date().toISOString() });
    localStorage.setItem('winmore_users', JSON.stringify(users));
    console.log('User registered and saved:', phone);
  }
});
