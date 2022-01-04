const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');

const methodOverride = require('method-override');

const expressError = require('./utils/expressError');
const ejsMate = require('ejs-mate');

const usersRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./modules/user');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected")
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))


app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(flash());

const sessionConfig = {
    secret: 'thisisshoulbasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        HttpOnly: true, // this is default was true 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
        //    miliseconds * seconds * minutes * hours * days = 1 week in miliseconds
    }

}
app.use(session(sessionConfig)) //after this line use passport(required)


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // authenticate - Generates a function that is used in Passport's LocalStrategy

passport.serializeUser(User.serializeUser()); // Generates a function that is used by Passport to serialize(தொடராக) users into the session
passport.deserializeUser(User.deserializeUser()); //  Generates a function that is used by Passport to deserialize users into the session



app.use((req, res, next) => {
    // console.log(req.session)
    if(!['/login','/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user; // if currentUser id true it means signed In
    // The 'req.isAuthenticated()' method only tells us that if someone is logged in. req.user tells us who is logged in.
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// simple exam for passport creating a fake user
// app.get('/fakeuser',async(req,res)=>{
//     const user = new User({email:'ahamed@gmail.com' , username:'hussain'})
//     const newUser = await User.register(user,'itachi07') // itachi07 is password it will add salts and hash and store it
//     res.send(newUser)
// })


app.use('/',usersRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
// we passing the id as prefix so we get null value while finding the id
// in express.Router() we need pass object(parameter)
// like this express.Router(mergeParams:true)



// home 
app.get('/', (req, res) => {
    res.render('home')
})


// In below I did it for example to create a new object(campground)
// app.get('/makecampground',async(req,res)=>{
//     const camp = new CampGround({title:'Adirai' , description:'there was lot of mosques there'})
//     await camp.save();
//     res.send(camp)
// })

app.all('*', (req, res, next) => {
    // res.send('Page Not Available')
    next(new expressError('page is not available', 404));
})

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'something went wrong'
    res.status(statusCode).render('error', { err })
    // res.send("oh boy , something went wrong")
})

app.listen(3000, () => {
    console.log("Listening to the 3000 portal")
})