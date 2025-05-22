const { User } = require('../models')
const config = require('../config/config.json');
const jwt = require('jsonwebtoken');

// JWT Config
const jwtSecret = config.jwt;
const expiry = '1h';

/*
    singup: [/users/signup]: creates user
    Required Args: Req Body must contain email and password
    Connections: SQL
*/
async function signup(req, res) {
    // Validate user/password data exists
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    // Validate user doesn't already exist
    try {
        const user = await User.findOne({ where: { email } });
        if (user != null) {
            return res.status(409).json({ message: 'Username already taken' });
        }
        await User.create({ email, password });
        return res.status(201).json({ message: "Account successfully created" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/*
    login: [/users/login]: validates user, returns jwt token
    Required Args: Req Body must contain email and password
    Connections: SQL
*/
async function login(req, res) {
    // Validate user/password data exists
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    // Check if credentials are valid
    try {
        const user = await User.findOne({ where: { email } });
        if (user == null) {
            return res.status(404).json({ message: "Account not found" });
        } else if (!user.validPassword(password)) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ id: user.id }, jwtSecret, {
            expiresIn: expiry
        });

        return res.status(200).json({ message: "Successful Login", token: token })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    signup,
    login,
};  