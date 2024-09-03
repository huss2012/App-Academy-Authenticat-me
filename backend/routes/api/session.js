const express = require('express');
const router = express.Router();

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValdiationErrors } = require('../../utils/validation');

//Validation of login req.body:
const validationLogin = [
    check('credential')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("please provide a valid email or username."),
    check("password")
        .exists({ checkFalsy: true })
        .withMessage("Please provide a password."),
    handleValdiationErrors
];

//Login route
router.post('/',
    validationLogin,
    async (req, res, next) => {
        const { credential, password } = req.body;

        const user = await User.login({ credential, password });

        if (!user) {
            const err = new Error('Login faild');
            err.status = 401;
            err.title = 'Login failes';
            err.errors = ['The provided creditionals were invalid.'];
            return next(err);
        }
        await setTokenCookie(res, user);

        return res.json({
            user
        });
    });

//Logout route:
router.delete('/', (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: "success" });
});


router.get('/', restoreUser, (req, res) => {
    const { user } = req;
    if (user) {
        return res.json({
            user: user.toSafeObject()
        });
    } else return res.json({});
    // !user ? res.json({}) : res.json({ user: user.toSafeObject() });
});
module.exports = router;
