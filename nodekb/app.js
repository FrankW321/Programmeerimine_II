const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

const multer  = require('multer')


const dbConnectionOptions = {
  useMongoClient: true,
  authSource:'admin'
}

// mongoose.connect('mongodb://localhost/nodekb', dbConnectionOptions);
mongoose.connect(config.database, dbConnectionOptions);
let db = mongoose.connection;

//check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

//check for db errors
db.on('error', function(err){
  console.log(err);
});

//init app
const app = express();

//bring in models
let Product = require('./models/product');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// body parser middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//passport config
require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

//home route
app.get('/', function(req, res){
  Product.find({}, function(err, products){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title:'Products',
        products: products
      });
    }
  });
});

//route files
let products = require('./routes/products');
let users = require('./routes/users');
app.use('/products', products);
app.use('/users', users);


/* does not work!

//set storage engine

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//init upload
const upload = multer({
  storage:storage,
  limits:{fileSize: 7000000},
  fileFilter:function(req, file, cb){
    checkFileType(file,cb);
  }
}).single('myImage');

//check file type
function checkFileType(file, cb){
  //allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  //check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb('Error: Images Only');
  }
}


//public folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('./views/edit_product.pug'));

app.post('/upload', (req, res) =>{
  upload(req, res, (err) => {
    if(err){
      res.render('./views/edit_product.pug',{
        msg:err
      });
    } else {
      if(req.file == undefined){
        res.render('./views/edit_product.pug',{
          msg:'Error: No File Selected'
        });
        } else {
      res.render('./views/edit_product.pug', {
        msg: 'File Uploaded!',
        file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});
*/

//start server
app.listen(3000, function(){
  console.log('Server started on port 3000');
});
