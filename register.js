document.addEventListener('DOMContentLoaded', () => {
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const backBtn = document.getElementById('back-btn');
    
    // Step 1: Send OTP
    sendOtpBtn.addEventListener('click', async () => {
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm-password').value;

        // Basic Validation
        if (!phone || phone.length < 10) return alert("Please enter a valid phone number");
        if (password !== confirm) return alert("Passwords do not match");
        if (password.length < 8) return alert("Password too short");

        sendOtpBtn.innerText = "Sending...";
        sendOtpBtn.disabled = true;

        try {
            const response = await fetch('/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await response.json();

            if (data.success) {
                document.getElementById('step-1').classList.add('hidden');
                document.getElementById('step-2').classList.remove('hidden');
                document.getElementById('otp-phone-display').innerText = phone;
                startTimer();
            } else {
                alert("Error: " + data.error);
                sendOtpBtn.disabled = false;
                sendOtpBtn.innerText = "Send OTP";
            }
        } catch (error) {
            console.error(error);
            alert("Failed to connect to server.");
            sendOtpBtn.disabled = false;
            sendOtpBtn.innerText = "Send OTP";
        }
    });

    // Step 2: Verify OTP
    verifyOtpBtn.addEventListener('click', async () => {
        const phone = document.getElementById('reg-phone').value;
        const otp = document.getElementById('reg-otp').value;
        const password = document.getElementById('reg-password').value;
        const inviteCode = document.getElementById('reg-invite').value;

        try {
            const response = await fetch('/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await response.json();

            if (data.success) {
                // OTP Verified. Now Register on Server to save to Excel and send SMS.
                const regResponse = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, password })
                });
                const regData = await regResponse.json();

                if (regData.success) {
                    // Save user session locally
                    localStorage.setItem('user', JSON.stringify({ phone: phone, referrer: inviteCode }));
                    document.getElementById('step-2').classList.add('hidden');
                    document.getElementById('step-3').classList.remove('hidden');
                } else {
                    alert("Registration Error: " + regData.error);
                }
            } else {
                alert("Invalid OTP. Please try again.");
            }
        } catch (error) {
            alert("Verification failed.");
        }
    });

    // Timer Logic
    function startTimer() {
        let time = 20;
        const timerEl = document.getElementById('timer');
        const interval = setInterval(() => {
            time--;
            timerEl.innerText = time;
            if (time <= 0) clearInterval(interval);
        }, 1000);
    }

    // Back Button
    backBtn.addEventListener('click', () => {
        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-1').classList.remove('hidden');
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerText = "Send OTP";
    });
});