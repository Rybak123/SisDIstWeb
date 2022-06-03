if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  const mysql = require('mysql');
  const bodyparser = require('body-parser');
  const dotenv = require('dotenv');
  const axios = require('axios').default;
  var port = process.env.PORT || 5000;
  app.use(bodyparser.json());

  var direccionURLAPI="127.0.0.1:3000";
  //quitar
  var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user: process.env.db_user_name,
    password: process.env.db_password,
    database: process.env.db_name
  });
  
  mysqlConnection.connect((err)=>{
    if(!err)
    console.log('DB connection succeeded')
    else
    console.log('DB connection failed \n Error :' + JSON.stringify(err,undefined,2));
  })
 

  const users = []

    users.push({
      id: Date.now().toString(),
      name: 'Admin',
      email: process.env.login_id,
      password: process.env.login_password
    })
  

  const initializePassport = require('./passport-config')
const e = require('express')
  initializePassport(
    
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )
  

  app.use( express.static( "public" ) )
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
    //quitar
  app.get("/", checkAuthenticated, (req, res) => {

    axios.get("http://"+direccionURLAPI+"/univalle/v1/orders/orderIndex", {

    })
    .then(function (response) {
      console.log("Llegó")
      res.render('index.ejs',{
        total_sales:response.data.rows1,
        ord_num:response.data.rows2,
        stock_num:response.data.rows3,
        total_stock:response.data.rows4
        });
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  )
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      console.log(users)
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  
  app.listen(port, ()=>console.log(`Express Server is running at ${port} port`))
  app.get('/employees', (req,res) =>{
    mysqlConnection.query('SELECT * FROM warehouse', (err, rows, fields)=>{
      if(!err)
      res.send(rows);
      else
      console.log(err);
    })
  })


  var request = require('request');
  

//View Orders
  app.get('/orders', checkAuthenticated,(req,res) =>{


    axios.get("http://"+direccionURLAPI+"/univalle/v1/orders/orders", {

    })
    .then(function (response) {
        console.log(response.data)
        res.render('orders.ejs',{
        orders:response.data.rows, sub_orders:response.data.rows1, selected_item:'None', month_name:'None', year:'None'
        });
    })
    .catch(function (error) {
      console.log(error);
    });
  
  })

  //View Stocks
  app.get('/viewstocks', checkAuthenticated,(req,res) =>{

    axios.get("http://"+direccionURLAPI+"/univalle/v1/stocks/viewstocks", {

    })
    .then(function (response) {

      console.log(response.data)
      res.render('viewstocks.ejs',{
      all_stocks:response.data.rows, brands:response.data.rows1, categories:response.data.rows2,  display_content:'None', filter_type:'None', filter_name:'None'
      

      });
    })
    .catch(function (error) {
      console.log(error);
    });


   


    
  })

  //Stocks Query Filter
  app.post('/stocks_query',checkAuthenticated, (req, res) => {

    var brand_name = req.body['selected_brand']
    var category_name = req.body['selected_category']
    var selected_item = req.body['exampleRadios']
    axios.post("http://"+direccionURLAPI+"/univalle/v1/stocks/stocks_query", {
      selected_category:category_name,
      selected_brand:brand_name,
      exampleRadios:selected_item
    })
    .then(function (response) {
        if(selected_item == 'brand')
        {
          res.render('viewstocks.ejs',{
            all_stocks:response.data.rows, brands:response.data.rows1, categories:response.data.rows2, display_content:response.data.rows3, filter_type:'brand', filter_name:brand_name
          });
        }
        if(selected_item == 'category')
        {
          res.render('viewstocks.ejs',{
            all_stocks:response.data.rows, brands:response.data.rows1, categories:response.data.rows2, display_content:response.data.rows3, filter_type:'category', filter_name:category_name
          });
        }
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  //Fetch Items by ID for billing
  app.post('/fetchitem',checkAuthenticated, (req, res) =>{
    
    axios.post("http://"+direccionURLAPI+"/univalle/v1/items/fetchItem", {
      itemid : req.body.itemid
    })
    .then(function (response) {
      console.log(response.data)
      res.json({success : "Updated Successfully", status : 200, rows:response.data.rows});
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  //Billing
  app.get('/billing',checkAuthenticated, (req, res) => {
    axios.get("http://"+direccionURLAPI+"/univalle/v1/billing/billing", {
    })
    .then(function (response) {
        var category = response.data.rows1
        var brand = response.data.rows2
        var size = response.data.rows3
        res.render('bill.ejs',{category:category, brand:brand, size:size})
    })
    .catch(function (error) {
      console.log(error);
    });
})

//Add New Category
  app.post('/addcategory',checkAuthenticated,(req,res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/category/addcategory", {
      new:req.body.new
    })
    .then(function (response) {
       res.redirect('/categories')
    })
    .catch(function (error) {
      console.log(error);
    });
  })
  //Add New Brand
  app.post('/addbrand',checkAuthenticated,(req,res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/brand/addbrand", {
      new:req.body.new
    })
    .then(function (response) {
      res.redirect('/brands')
    })
    .catch(function (error) {
      console.log(error);
    });
  })
  //Add New Size
  app.post('/addsize',checkAuthenticated,(req,res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/sizes/addsize", {
      new:req.body.new
    })
    .then(function (response) {
      res.redirect('/sizes')
    })
    .catch(function (error) {
      console.log(error);
    });    
  })
  //Orders Filter Query
  app.post('/orders_query', checkAuthenticated,(req,res) => {
    var time_type = req.body['exampleRadios']
    var month= req.body['selected_month']
    var year = req.body['selected_year']

    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    var month_name = monthNames[parseInt(month-1)]

    axios.post("http://"+direccionURLAPI+"/univalle/v1/orders/orders_query", {
      exampleRadios:time_type,
      selected_month:month,
      selected_year:year
    })
    .then(function (response) {
      if (time_type == 'month'){
        res.render('orders.ejs',{
          orders:response.data.rows, sub_orders:response.data.rows1, selected_item:'month', month_name:month_name, year:year
        });
      }
      if (time_type == 'year'){
        res.render('orders.ejs',{
          orders:response.data.rows, sub_orders:response.data.rows1, selected_item:'year', month_name:'None', year:year
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  //Sales Filter
  app.get('/sales_filter', checkAuthenticated,(req, res) => {
    rows = {}
    res.render('sales_filter.ejs',{is_paramater_set : false,time_type: 'none', filter_type: 'none', display_content: rows, month_name: 'None', year:"None", total_amount:"None"})
  })

  app.get('/stock_filter', (req, res) => {
    res.render('stock_filter.ejs', {filter_type: 'None',display_content: {}, total_items:{}})
  })

  //Stock Filter
  app.post('/stock_filter_query', checkAuthenticated,(req, res) => {
    var filter_type = req.body['exampleRadios1']
    axios.get("http://"+direccionURLAPI+"/univalle/v1/stocks/stock_filter_query", {
    })
    .then(function (response) {
        if(filter_type == 'brand'){
          res.render('stock_filter.ejs',{filter_type: filter_type,display_content: response.data.rows, total_items:response.data.rows1}) 
        }
        if(filter_type == 'category'){
          res.render('stock_filter.ejs',{filter_type: filter_type,display_content: response.data.rows, total_items:response.data.rows1}) 
        }
    })
    .catch(function (error) {
      console.log(error);
    }); 
  });

  //Sales Filter
  app.post('/sales_filter_query', checkAuthenticated,(req, res) => {
    var time_type = req.body['exampleRadios'];
    var month= req.body['selected_month'];
    var year = req.body['selected_year'];
    axios.post("http://"+direccionURLAPI+"/univalle/v1/orders/orders_query", {
      exampleRadios:time_type,
      selected_month:month,
      selected_year:year
    })
    .then(function (response) {
      
      if(time_type == 'month'){
        if(req.body['exampleRadios1']=="all"){
          var total_amount = response.data.rows1
          res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'all', display_content: response.data.rows, month_name: month_name, year:year, total_amount:total_amount})
        }
        if(req.body['exampleRadios1']=="brand"){
          var total_amount = response.data.rows1
          res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'brand', display_content: response.data.rows, month_name: month_name, year:year, total_amount:total_amount})
        }
        if(req.body['exampleRadios1']=="category"){
          var total_amount = response.data.rows1
          res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'category', display_content: response.data.rows, month_name: month_name, year:year, total_amount:total_amount})
        }
      }
      if(time_type == 'year'){
        if(req.body['exampleRadios1']=="all"){
          var total_amount = response.data.rows1
          res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'all', display_content: response.data.rows, month_name: 'None', year:year, total_amount:total_amount})
        }
        if(req.body['exampleRadios1']=="brand"){
          var total_amount = response.data.rows1
          res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'brand', display_content: response.data.rows, month_name: 'None', year:year, total_amount:total_amount}) 
        }
        if(req.body['exampleRadios1']=="category"){
          var total_amount = response.data.rows1
          res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'category', display_content: response.data.rows, month_name: 'None', year:year, total_amount:total_amount})        
        }
      }   

    })
    .catch(function (error) {
      console.log(error);
    });



     
  })

  //View Categories
  app.get('/categories', checkAuthenticated,(req, res) => {
    axios.get("http://"+direccionURLAPI+"/univalle/v1/category/categories", {

    })
    .then(function (response) {
      var category = response.data.rows1
    res.render('categories.ejs', {category:category})
    })
    .catch(function (error) {
      console.log(error);
    });
   
})

//View Brands
//Ver marcas rows 2


  app.get('/brands', checkAuthenticated,(req, res) => {
    axios.get("http://"+direccionURLAPI+"/univalle/v1/brand/brands", {

    })
    .then(function (response) {
      var brand = response.data.rows2
      res.render('brands.ejs',{brand:brand})
    })
    .catch(function (error) {
      console.log(error);
    });
})

//View Sizes
  app.get('/sizes', checkAuthenticated,(req, res) => {
    axios.get("http://"+direccionURLAPI+"/univalle/v1/sizes/sizes", {

    })
    .then(function (response) {
      var size = response.data.rows2
      res.render('sizes.ejs',{size:size})
    })
    .catch(function (error) {
      console.log(error);
    });

   
  })


  app.get('/stocks', checkAuthenticated,(req, res) => {

    axios.get("http://"+direccionURLAPI+"/univalle/v1/stocks/stocks", {

    })
    .then(function (response) {
      var category = response.data.rows1
      var brand = response.data.rows2
      var size = response.data.rows3
      res.render('stocks.ejs',{category:category, brand:brand, size:size})
    })
    .catch(function (error) {
      console.log(error);
    });

  
  })

  //Submit Bill
  //Enviar recibo , redirige a Ordenes la pagina
  app.post('/submitbill', checkAuthenticated,(req, res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/billing/submitbill", {
      cuerpo:req.body
    })
    .then(function (response) {
      res.redirect('/orders')
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  //Submit Stock
  //Submit stock redirect  res.redirect('/viewstocks')
  app.post('/submitstock', checkAuthenticated,(req, res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/stocks/submitStocks", {
      cuerpo:req.body
    })
    .then(function (response) {
      res.redirect('/viewstocks')
    })
    .catch(function (error) {
      console.log(error);
    });
  })



  app.post('/deleteitem', checkAuthenticated,(req,res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/orders/deleteitem", {
      deleteid:req.body.ItemID
    })
    .then(function (response) {
      res.redirect('/orders')
    })
    .catch(function (error) {
      console.log(error);
    });
      
  })


  app.post('/deletecategory', checkAuthenticated,(req,res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/category/deletecategory", {
      deleteid:req.body.deleteid
    })
    .then(function (response) {
      res.redirect('/categories')
    })
    .catch(function (error) {
      console.log(error);
    });

  })

 
  app.post('/deletebrand', checkAuthenticated,(req,res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/brand/deletebrand", {
      deleteid:req.body.deleteid
    })
    .then(function (response) {
      res.redirect('/brands')
    })
    .catch(function (error) {
      console.log(error);
    });
  
  })

  
  app.post('/deletesize', checkAuthenticated,(req,res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/sizes/deletesize", {
      deleteid:req.body.deleteid
    })
    .then(function (response) {
      res.redirect('/sizes')
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  app.post('/deletestock', checkAuthenticated,(req,res) => {
    axios.post("http://"+direccionURLAPI+"/univalle/v1/stocks/deletestock", {
      deleteid:req.body.deleteid
    })
    .then(function (response) {
      res.redirect('/viewstocks')
    })
    .catch(function (error) {
      console.log(error);
    });
 
  })