const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userModel = require('../model/Auth');

const jwtSecret = process.env.JWT_SECRET;


const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendMail(to, subject, htmlContent) {
    try {
        await transport.sendMail({
            from: process.env.EMAIL,
            to: to,
            subject: subject,
            html: htmlContent
        });
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email.");
    }
}

const register = async (req, res) => {
    const { firstName, email, password, lastName } = req.body;

    try {
        if (!firstName || !email || !password || !lastName) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingCandidate = await userModel.findOne({ email });
        if (existingCandidate) {
            return res.status(400).json({ error: "User with this email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiration = Date.now() + 10 * 60 * 1000;

        const newCandidate = await userModel.create({
            firstName: firstName.toLowerCase(),
            email,
            password: hashedPassword,
            lastName: lastName.toLowerCase(),
            verificationToken: otp,
            otpExpiration,
            isVerified: false
        });

        const subject = "Verify Your Email - OTP Included";
        const message = `
        <html>
        <body>
            <h1>Verify Your Email</h1>
            <p>Hello, ${newCandidate.firstName}!</p>
            <p>Please verify your email by entering the following one-time password (OTP):</p>
            <p><strong>${otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you did not request this verification, please ignore this email.</p>
        </body>
        </html>
        `;
        await sendMail(email, subject, message);

        return res.status(201).json({ msg: "User account registered successfully. Please verify your email.", newCandidate });
    } catch (error) {
        res.status(500).json({ error: "Failed to register user" });
    }
}


const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const candidate = await userModel.findOne({ email });
        if (!candidate) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        if (candidate.otpExpiration < Date.now()) {
            return res.status(400).json({ error: "OTP expired" });
        }
        if (candidate.verificationToken !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        candidate.isVerified = true;
        candidate.verificationToken = null;
        candidate.otpExpiration = null
        await candidate.save();

        return res.status(200).json({ msg: "Email verification successful" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to verify email" });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const candidate = await userModel.findOne({ email });
        if (!candidate) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        if (!candidate.isVerified) {
            return res.status(403).json({ error: "Email is not verified" });
        }
        const isMatch = await bcrypt.compare(password, candidate.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: candidate._id }, jwtSecret, { expiresIn: '1h' });
        return res.json({
            msg: "Logged in successfully",
            token,
            candidate: {
                _id: candidate._id,
                email: candidate.email
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });

    }

}

module.exports = {
    register,
    verifyEmail,
    login,
}