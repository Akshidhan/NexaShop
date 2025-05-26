const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const Seller = require('../models/seller.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');

// Get user by ID

const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Create a new user

const createUser = async (req, res) => {
    if(!req.body.role) {
        return res.status(400).json({ message: 'Role is required' });
    }
    if (req.body.role === 'user') {
        const { username, password, email, addresses } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Username, password, and email are required.' });
        }

        if(User.find({ username })) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if(User.find({ email })) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username,
                password: hashedPassword,
                email,
                addresses
            });
            await newUser.save();
            return res.status(201).json("User created successfully!");
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    } else if (req.body.role === 'seller') {
        const { sellerName, sellerDescription, username, password, email, location, businessRegistrationNumber } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const newSeller = new Seller({
                sellerName,
                sellerDescription,
                username,
                password: hashedPassword,
                email,
                location,
                businessRegistrationNumber
            });

            await newSeller.save();
            res.status(201).json("Seller created successfully!");
        }
        catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    } else if (req.body.role === 'Admin') {
        return res.status(403).json({ message: 'Forbidden for Admin role' });
    } else {
        return res.status(400).json({ message: 'Invalid role' });
    }
}

const addUserImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Image not uploaded'});
    }

    const { id } = req.params;
    if(!id) {
        return res.status(400).json({ message: 'User ID not provided'});
    }

    let user;
     
    // Get user based on their ID, regardless of role
    try {
        user = await User.findById(id);
        if (!user) {
            // Try to find as seller if not found as regular user
            user = await Seller.findById(id);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
        }
        
        // Delete old image if it exists and has a publicId
        if (user.userImage && user.userImage.publicId) {
            try {
                await cloudinary.uploader.destroy(user.userImage.publicId);
            } catch (deleteError) {
                console.error("Error deleting old image:", deleteError);
                // Continue with upload even if delete fails
            }
        }
        
        try {
            // Upload new image to Cloudinary
            const cloudinaryResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                  {
                    folder: 'ecommerce-users',
                    format: 'webp',
                    quality: 'auto'
                  },
                  (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                  }
                ).end(req.file.buffer);
            });
            
            user.userImage = {
                url: cloudinaryResult.secure_url,
                publicId: cloudinaryResult.public_id
            };
            
            await user.save();
            
            return res.status(200).json({ 
                message: 'Image uploaded successfully',
                userImage: user.userImage
            });
            
        } catch (uploadError) {
            console.error("Upload error:", uploadError);
            
            user.userImage = {
                url: "https://via.placeholder.com/150",
                publicId: "error-placeholder"
            };
            
            await user.save();
            
            return res.status(207).json({
                message: 'Image saved with placeholder due to upload error',
                error: uploadError.message
            });
        }
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}

//Delete a user

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }

}

// Update password
const updateUserPassword = async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required.' });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Update username
const updateUsername = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Please enter a username' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.username = username;
        await user.save();

        res.json({ message: 'Username updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const updateAddress = async (req, res) => {
    const { id } = req.params;
    const { addresses } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.addresses = addresses;
        await user.save();

        res.json({ message: 'Address updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//search a user
const searchUsers = async (req, res) => {
    const username = req.body.username;

    try {
        const users = await User.find({ username: { $regex: username, $options: 'i' } });
        if (!users.length) {
            return res.status(400).json({ message: 'No users found' });
        }
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Count total users for pagination metadata
        const totalUsers = await User.countDocuments();
        
        // Get paginated users
        const users = await User.find()
            .skip(skip)
            .limit(limit)
            .lean();

        if (!users.length) {
            return res.status(400).json({ message: 'No users found' });
        }

        // Return users with pagination metadata
        res.json({
            users,
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Get all sellers
const getAllSellers = async (req, res) => {
    try {
        const sellers = await Seller.find().lean();
        if (!sellers.length) {
            return res.status(400).json({ message: 'No sellers found' });
        }
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    getUserById,
    createUser,
    addUserImage,
    deleteUser,
    updateUserPassword,
    updateUsername,
    updateAddress,
    searchUsers,
    getAllUsers,
    getAllSellers
}