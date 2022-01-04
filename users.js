const express = require('express');
const route = express.Router();
const passport = require('passport');
const User = require('../modules/user');
const asyncError = require('../utils/asyncError');


route.get('/register', (req, res) => {
    res.render('users/register')
})

route.post('/register', asyncError(async (req, res,next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registerdUser = await User.register(user, password)
        req.login(registerdUser, (err) => { // in req.login we can't use await so we need to use callback
            if (err) return next(err);
            // console.log(registerdUser)
            req.flash('success', 'welcome to the yelpcamp')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}))

route.get('/login', (req, res) => {
    res.render('users/login')
})

route.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back !!')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl);
})

route.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'goodbye logout successfully!!')
    res.redirect('/campgrounds')

})



module.exports = route;