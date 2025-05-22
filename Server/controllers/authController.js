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
        } else if (role === 'seller') {
            user = await Seller.findOne({ username }).exec();
        } else if(role === 'user') {
            user = await User.findOne({ username }).exec();
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Create access token (short-lived)
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    id: user._id,
                    username: user.username,
                    role: role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        // Create refresh token (longer-lived)
        const refreshToken = jwt.sign(
            {
                UserInfo: {
                    id: user._id,
                    username: user.username,
                    role: role
                }
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Store refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day (matching refresh token expiry)
        });

        // Send access token to client
        res.status(200).json({ 
            accessToken,
            user: {
                id: user._id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const refresh = async (req, res) => {
    const cookies = req.cookies;

    // Check if JWT cookie exists
    if (!cookies?.refreshToken) {
        return res.status(401).json({ message: 'Unauthorized - No refresh token' });
    }

    const refreshToken = cookies.refreshToken;

    try {
        // Verify the refresh token
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) {
                    console.error('Refresh token error:', err.message);
                    return res.status(403).json({ message: 'Forbidden - Invalid refresh token' });
                }

                // Create new access token
                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            id: decoded.UserInfo.id,
                            username: decoded.UserInfo.username,
                            role: decoded.UserInfo.role
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' } // Consistent with login
                );

                // Send new access token
                return res.status(200).json({ 
                    accessToken,
                    user: {
                        id: decoded.UserInfo.id,
                        username: decoded.UserInfo.username,
                        role: decoded.UserInfo.role
                    }
                });
            }
        );
    } catch (error) {
        console.error('Refresh error:', error);
        return res.status(500).json({ message: 'Server error during token refresh' });
    }
}

const logout = (req, res) => {
    try {
        const cookies = req.cookies;
        
        if (!cookies?.refreshToken) {
            return res.sendStatus(204); // No content to send back
        }
        
        // Clear the JWT cookie with same settings as when it was created
        // Note: Using 'Strict' in login but 'None' in logout - making this consistent with login
        res.clearCookie('refreshToken', { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'Strict',
            maxAge: 0
        });
        
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Server error during logout' });
    }
}

module.exports = {
    login,
    refresh,
    logout
}