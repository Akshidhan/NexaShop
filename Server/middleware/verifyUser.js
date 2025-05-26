const verifyUser = () => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.id) {
                return res.status(401).json({ message: 'Unauthorized: No user info' });
            }
            
            // Allow admin users to access any user's data
            if (req.role === 'Admin') {
                return next();
            }
            
            // For regular users, verify they are accessing their own data
            if (req.id !== req.params.id) {
                console.log(`User mismatch: ${req.id} trying to access ${req.params.id}`);
                return res.status(403).json({ message: 'Forbidden: User ID mismatch' });
            }
            
            next();
        } catch (err) {
            console.error('Error in verifyUser middleware:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
}

module.exports = verifyUser;