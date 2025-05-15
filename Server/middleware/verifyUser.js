const verifyUser = () => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.id) {
                return res.status(401).json({ message: 'Unauthorized: No user info' });
            }
            if (req.id !== req.params.id) {
                return res.status(403).json({ message: 'Forbidden: User ID mismatch' });
            }
            next();
        } catch (err) {
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
}

module.exports = verifyUser;