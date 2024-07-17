const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/User.js');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')


const router = express.Router();

router.post('/signup', async (req, res) => {
    const { firstname,lastname, email, password } = req.body;

    try {

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }


        const hashPassword = await bcrypt.hash(password, 10);


        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashPassword
        });


        await newUser.save();

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error in signup:", error);
        return res.status(500).json({ message: "Error registering user", error });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not registered' });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Password is incorrect" });
      }
  
      const token = jwt.sign({ userId: user._id, email: user.email}, process.env.KEY, { expiresIn: '1h' });
      console.log("Generated token:", token);
  
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    
      return res.json({ status: true, message: "Login successful", token });
    } catch (error) {
      console.error("Error in login:", error);
      return res.status(500).json({ message: "Error logging in", error });
    }
  });
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ status: false, message: "User not found" });
        }

        const token = jwt.sign({ id: user.id }, process.env.KEY, { expiresIn: '1h' });

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD_APP
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        var mailOptions = {
            from: 'No Reply <no-reply@test.com>',
            to: email,
            subject: 'Reset Password',
            text: `Click this link to reset your password: http://localhost:5173/resetpassword/${token}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ status: false, message: "Error sending email" });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ status: true, message: "Email sent successfully" });
            }
        });

    } catch (err) {
        console.error('Error in forgot password:', err);
        return res.status(500).json({ status: false, message: "Server error" });
    }
});
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body
    try {
        const decoded = jwt.verify(token, process.env.KEY);
        const id = decoded.id;
        const hashPassword = await bcrypt.hash(password, 10)
        await User.findByIdAndUpdate({ _id: id }, { password: hashPassword })
        return res.status(200).json({ message: "updated record" })

    } catch (err) {
        return res.status(403).json({ message: "invalid token" })
    }
})

const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ status: false, message: "No token found" });
        }
        const decoded = await jwt.verify(token, process.env.KEY);
        console.log("Decoded token:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Error verifying user:', err);
        return res.status(401).json({ status: false, message: "Unauthorized" });
    }
};
router.get("/verify", verifyUser, (req, res) => {
    return res.json({ status: true, message: "authorized" })
});

router.get("/logout", (req, res) => {
    res.clearCookie("token")
    return res.json({status: true})

    router.use('/subscription', subscriptionRoutes);

})
router.get('/user/:userId', verifyUser, async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user details', error });
    }
  });
  
module.exports = {
    UserRouter: router,
    verifyUser
}