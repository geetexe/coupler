const adminAuth = (req, res, next) => {
    const isAdmin = false;
    isAdmin && next();
    res.status(401).send("Invalid user.");
}

const userAuth = (req, res, next) => {
    const isUserValid = true;
    isUserValid && next();
    res.status(401).send("Invalid user.");
}

module.exports = { adminAuth, userAuth };