const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(403).json({ message: "Accès refusé ! Aucun token fourni." });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), "Secret_MediSync");
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalide ou expiré !" });
    }
};

module.exports = verifyToken;
