const { User } = require('../models')
async function signup(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (user != null) {
            return res.status(409).json({ message: 'Username already taken' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });

    }
    

    try {
        await User.create({ email, password });
        return res.status(201).json({ message: "Account successfully created" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing parameters' });
    }
    
    try {
        const user = await User.findOne({ where: { email } });
        if (user == null) {
            return res.status(404).json({ message: "Account not found" });
        } else if (user.password != password) {
            return res.status(401).json({ message: "Invalid password" });
        }
        return res.status(200).json({ message: "Successful Login" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    signup,
    login,
};  