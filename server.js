require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// Serve your HTML/CSS/JS files
app.use(express.static(path.join(__dirname, '.')));

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error("Error: Twilio credentials missing in .env file");
    process.exit(1);
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Temporary in-memory store for OTPs (Use a database in production)
const otpStore = {};

// Excel File Path
const USERS_FILE = path.join(__dirname, 'users.xlsx');

// Helper to get users from Excel
const getUsers = () => {
    if (fs.existsSync(USERS_FILE)) {
        const workbook = xlsx.readFile(USERS_FILE);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return xlsx.utils.sheet_to_json(sheet);
    }
    return [];
};

app.post('/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone required" });

    // Check if user already exists in Excel
    const users = getUsers();
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
        return res.status(400).json({ success: false, error: "Phone number already registered." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Store OTP against phone number
    otpStore[phone] = otp;

    // Send SMS
    client.messages.create({
        body: `Your Win More verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : '+91' + phone // Default to India (+91) if no code provided
    })
    .then(message => res.json({ success: true, message: "OTP sent" }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.post('/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    if (otpStore[phone] && otpStore[phone] == otp) {
        delete otpStore[phone]; // Clear OTP after use
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, error: "Invalid OTP" });
    }
});

app.post('/register', (req, res) => {
    const { phone, password } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone required" });

    // Check for duplicates again
    const users = getUsers();
    if (users.find(u => u.phone === phone)) {
        return res.status(400).json({ success: false, error: "User already registered" });
    }

    // Generate User ID
    const userId = 'USER' + Math.floor(100000 + Math.random() * 900000);
    
    // Save to Excel
    users.push({ userId, phone, password, date: new Date().toISOString() });
    const newWorkbook = xlsx.utils.book_new();
    const newSheet = xlsx.utils.json_to_sheet(users);
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Users");
    xlsx.writeFile(newWorkbook, USERS_FILE);

    client.messages.create({
        body: `Welcome to Win More! Registration Successful.\nUser ID: ${userId}\nPassword: ${password}\nKeep this safe!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : '+91' + phone
    })
    .then(message => res.json({ success: true, message: "Registration successful. Credentials sent via SMS." }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));