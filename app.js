const express = require('express');
// const morgan = require('morgan');
const mongoose = require('mongoose');
const { urlencoded } = require('body-parser');
const multer = require('multer');
const path = require('path');

//Importing models
const { Book } = require('./models/Book');
const User = require('./models/User');
const Description = require('./models/Description');
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');

//express app (Creating new express application)
const app = express();

//register view engine
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(urlencoded());
// app.use(morgan('dev'));
app.use(function (req, res, next) {
    if (req.query._method == 'PUT') {
        req.method = 'PUT';
        req.url = req.path;
    }
    next();
});

mongoose.connect('mongodb+srv://piyush90:piyush@cluster0.ex8kt.mongodb.net/BookWorm?retryWrites=true&w=majority', { useNewUrlParser: true })

var msg = ''
//To upload an image write below 2 functions
var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({
    storage: storage
}).single('bookImage');


//Routes
app.get('/login', (req, res) => {
    res.render('login');
});

var loginFlag = false;
var inputEmail = '';
app.post('/login', (req, res) => {
    User.find()
        .then((result) => {
            inputEmail = req.body.loginEmail;
            // console.log(result);
            inputPass = req.body.loginPassword;
            result.forEach(element => {
                if (element.userEmail == inputEmail) {
                    loginFlag = true;
                    if (element.userPassword != inputPass) {
                        res.send('Incorrect Password!!');
                    } else {
                        res.redirect('/');
                    }
                }
                if (!loginFlag) {
                    res.send(`No profile found with ${inputEmail}. Please Signup to make one.`);
                    redirect('/login');
                }
            });
        }).catch((err) => {
            console.log(err);
        });
});

app.post('/signup', (req, res) => {
    const newUser = new User({
        userEmail: req.body.userEmail,
        userPassword: req.body.userPassword,
        userMobile: req.body.userMobile
    });
    newUser.save(function (err) {
        if (!err) {
            res.redirect('/');
        }
    });
});

app.get('/', (req, res) => {
    res.render('main', { username: inputEmail });
});

app.get('/sell', (req, res) => {
    res.render('sell', { username: inputEmail });
});

app.post('/sell', upload, (req, res) => {
    const newBook = new Book({
        bookName: req.body.bookName,
        bookGenre: req.body.bookGenre,
        bookCondition: req.body.bookCondition,
        bookPrice: req.body.bookPrice,
        sellerName: req.body.bookSeller,
        image: req.file.filename,
        sellerMob: req.body.sellerMob
    });
    newBook.save(function (err) {
        if (!err) {
            res.redirect('/');
        }
    });
});

app.get('/buy', (req, res) => {
    res.render('buy', { username: inputEmail });
});

app.get('/buy/:genre', (req, res) => {
    var description = "";
    Description.findOne({ genre: req.params.genre })
        .then((result) => {
            // console.log(result);
            description = result.description;

            Book.find({ bookGenre: req.params.genre })
                .then((result) => {
                    console.log(description);
                    res.render('genre', { genreBooks: result, username: inputEmail, genre: req.params.genre, genreDescription: description });
                }).catch((err) => {
                    console.log(err);
                });
        }).catch((err) => {
            console.log(err);
        });

});

app.get('/favourites', (req, res) => {
    if (loginFlag) {
        User.findOne({ userEmail: inputEmail })
            .then((result) => {
                console.log(result.favourites)
                res.render('favourites', { userEmail: inputEmail, favBooks: result.favourites });
            })
            .catch((err) => {
                console.log(err)
            });
    } else {
        res.redirect('/login');

    }
});

var favBook = "";
app.put('/favourites/:bookId', function (req, res) {
    const favouriteBookId = req.params.bookId;
    Book.findOne({ _id: favouriteBookId })
        .then((result) => {
            favBook = result;
            console.log(favBook);
            User.findOneAndUpdate({ userEmail: inputEmail },
                { $addToSet: { favourites: favBook } },
                { safe: true, upsert: true },
                function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Updated");
                    }
                })
                .catch((err) => {
                    console.log(err)
                });

            favBook = '';
            res.redirect("/");
        });
});
app.get('/removeBook/:id', (req, res)=>{
    var bookId = req.params.id;
    User.findOneAndUpdate({userEmail: inputEmail}, {$pull:{"favourites":{_id:bookId}}})
    .then((result)=>{
        console.log(result);
        res.redirect('/favourites');
    })
    .catch((err)=>{
        console.log(err);
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', { username: inputEmail });
});

app.listen(process.env.port || 3000);