const express = require('express');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValdiationErrors } = require('../../utils/validation');

const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email.'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    handleValdiationErrors
];

router.post('/', validateSignup, async (req, res) => {
    const { username, email, password } = req.body;

    const user = await User.signup({ username, email, password });

    await setTokenCookie(res, user);

    return res.json({
        user
    });
});

module.exports = router;
