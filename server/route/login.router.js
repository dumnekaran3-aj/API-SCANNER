const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../data/users.mdel.js");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { name, password, role } = req.body;

        if (!name || !password) {
            return res.status(400).json({ msg: "Please fill all required fields" });
        }

        const normalname = name.trim();

        const existingUser = await User.findOne({ name: normalname });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: normalname,
            role: role || "user",
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({ msg: "User added successfully" });
    } catch (err) {
        return res.status(500).json({ msg: "Server error" });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(401).json({ msg: "Please fill all fields" });
        }

        const normalname = name.trim();

        const user = await User.findOne({ name: normalname });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        const payload = {
            id: user._id,
            name: user.name,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_ENCRYPT, { expiresIn: "1d" });

        if (!token) {
            return res.status(401).json({ msg: "Token generation failed" });
        }

        return res.status(200).json({
            msg: "You are logged in",
            token,
            user: {
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;