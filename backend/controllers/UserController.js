const User = require('../models/User');

export async function signup(req, res) {
    const {username, password} = req.body;

    if (User.findByUsername()) {
        return res.status(409).json({ message: 'Username already taken' });
    }


    const userCreated = await User.createUser(username, password);
    return res.status(userCreated).json({ message: "Account successfully created"});
}


export function login(req, res) {

}