module.exports.isLoggedIn = (req,res,next)=>{
    // console.log("REQ.USER",req.user)
    // req.user it will store the signed information
    // The '.isAuthenticated()' method only tells us that if someone is logged in. req.user tells us who is logged in.
    if(!req.isAuthenticated()){
        // console.log(req.path,req.originalUrl)
        // req.session.returnTo = req.originalUrl;
        // req.path give only route path /new
        // req.originalUrl give current path which means take prefix also /campgrounds/new
        // we are going to use req.originalUrl
        req.flash('error','You must signedIn first')
        return res.redirect('/login')
    }
    next()
}