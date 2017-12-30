const express = require('express');
const router = express.Router();

//bring in product model
let Product = require('../models/product');
//user model
let User = require('../models/user');
//add route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_product', {
    title:'Add Product'
  });
});

//add submit POST route
router.post('/add', function(req, res){
  req.checkBody('title', 'Title is required').notEmpty();
//  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //get errors
  let errors = req.validationErrors()

  if(errors){
    res.render('add_product', {
      title:'Add Product',
      errors:errors
    });
  } else {
    let product = new Product();
    product.title = req.body.title;
    product.author = req.user._id;
    product.body = req.body.body;

    product.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'Product Added');
        res.redirect('/');
      }
    });
  }
});

//load edit form
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
  Product.findById(req.params.id, function(err, product){
    if(product.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      req.redirect('/');
    }
    res.render('edit_product', {
      title:'Edit Product',
      product:product
    });
  });
});
//update submit post
router.post('/edit/:id', function(req, res){
  let product = {};
  product.title = req.body.title;
  product.author = req.body.author;
  product.body = req.body.body;

let query = {_id:req.params.id}

  Product.update(query, product, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success','Product Updated');
      res.redirect('/');
    }
  });
});

//delte product
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Product.findById(req.params.id, function(err, product){
    if(product.author != req.user._id){
      res.status(500).send();
    } else {
      Product.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

//get single product
router.get('/:id', function(req, res) {
  Product.findById(req.params.id, function(err, product){
    User.findById(product.author, function(err, user){
      res.render('product', {
        product:product,
        author:user.name
      });
    });
  });
});

//access control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
