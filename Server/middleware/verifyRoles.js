const ROLES_LIST = {
    Admin: 'admin',
    Seller: 'seller',
    User: 'user'
}

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.role) return res.status(403).json({ message: 'No role found' });
        const rolesArray = [...allowedRoles];
        const userRoles = Array.isArray(req.role) ? req.role : [req.role];
        
        const allowedRoleValues = rolesArray.map(role => ROLES_LIST[role] || role);
        const hasRole = userRoles.some(role => allowedRoleValues.includes(role));
        if (!hasRole) return res.status(403).json({ message: 'Forbidden' });
        next();
    }
}

module.exports = verifyRoles;