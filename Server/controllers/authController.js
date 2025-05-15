const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const Seller = require('../models/seller.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if(role !== 'admin' && role !== 'user' && role !== 'seller') {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        let user;
        if(role === 'admin') {
            user = await Admin.findOne({ username }).exec();
        } else if ( role === 'seller') {
            user = await Seller.findOne({ username }).exec();
        } else if( role === 'user') {
            user = await User.findOne({ username }).exec();
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const accessToken = jwt.sign({
            UserInfo: {
                id: user._id,
                username: user.username,
                role: role
            },
        },process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            {
                UserInfo: {
                    id: user._id,
                    username: user.username,
                    role: role
                },
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('jwt', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000    
        });

        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const refresh = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const refreshToken = cookies.jwt;

    try {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Forbidden' });

                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            id: decoded.UserInfo.id,
                            username: decoded.UserInfo.username,
                            role: decoded.UserInfo.role
                        },
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '10m' }
                );

                res.status(200).json({ accessToken });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) 
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}