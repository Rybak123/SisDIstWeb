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

  var port = process.env.PORT || 5000;
  app.use(bodyparser.json());

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
  app.get('/', checkAuthenticated, (req, res) => {
   
  })
  
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

//View Orders
  app.get('/orders', checkAuthenticated,(req,res) =>{

    //Obtener rows y rows 1
    res.render('orders.ejs',{
      orders:rows, sub_orders:rows1, selected_item:'None', month_name:'None', year:'None'
    });
  })

  //View Stocks
  app.get('/viewstocks', checkAuthenticated,(req,res) =>{

    //Stocks obtener rows rows1 rows2

    res.render('viewstocks.ejs',{
      all_stocks:rows, brands:rows1, categories:rows2,  display_content:'None', filter_type:'None', filter_name:'None'
        });


    
  })

  //Stocks Query Filter
  app.post('/stocks_query',checkAuthenticated, (req, res) => {
    //Stocks obtener row row1 row2 y row 3
    res.render('viewstocks.ejs',{
      all_stocks:rows, brands:rows1, categories:rows2, display_content:rows3, filter_type:'brand', filter_name:brand_name
        });

   //ifcategory

   res.render('viewstocks.ejs',{
    all_stocks:rows, brands:rows1, categories:rows2, display_content:rows3, filter_type:'category', filter_name:category_name
      });
  
  })

  //Fetch Items by ID for billing
  app.post('/fetchitem',checkAuthenticated, (req, res) =>{
    //FetchItems obtener row
    res.json({success : "Updated Successfully", status : 200, rows:rows});


  })

  //Billing
  app.get('/billing',checkAuthenticated, (req, res) => {
    //Billing obtener row1 row2 row3
                var category = rows1
                var brand = rows2
                var size = rows3
    res.render('bill.ejs',{category:category, brand:brand, size:size})
 
    
   
})

//Add New Category
  app.post('/addcategory',checkAuthenticated,(req,res) => {
    //AñadirNUevaCategoria devolver row(no se usa)
    res.redirect('/categories')
  })

  //Add New Brand
  app.post('/addbrand',checkAuthenticated,(req,res) => {
    //AÑadirNUevaMarca
    res.redirect('/brands')

    
  })

  //Add New Size
  app.post('/addsize',checkAuthenticated,(req,res) => {
    //AÑadir nuevo tamaño
    res.redirect('/sizes')

    
  })

  //Orders Filter Query
  app.post('/orders_query', checkAuthenticated,(req,res) => {
    //OrdersFilterQery

    //Obtener row row1 year y mes
    //Month
    res.render('orders.ejs',{
      orders:rows, sub_orders:rows1, selected_item:'month', month_name:month_name, year:year
    });
    //Year

    res.render('orders.ejs',{
      orders:rows, sub_orders:rows1, selected_item:'year', month_name:'None', year:year
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
    //StockFilter
    //rows rows1
    //brand
    res.render('stock_filter.ejs',{filter_type: filter_type,display_content: rows, total_items:rows1}) 
    //category
    res.render('stock_filter.ejs',{filter_type: filter_type,display_content: rows, total_items:rows1}) 


    
  })

  //Sales Filter
  app.post('/sales_filter_query', checkAuthenticated,(req, res) => {

    //Obtener rows y rows1
    //time_type =month 
    var total_amount = rows1
    res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'brand', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
     //ExampleRadios1 ==brand
     var total_amount = rows1
     res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'all', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
     //req.body['exampleRadios1'] == 'category'
     var total_amount = rows1
     res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'month', filter_type: 'category', display_content: rows, month_name: month_name, year:year, total_amount:total_amount})
     //time_type == 'year'
     var total_amount = rows1
    res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'all', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})
      //req.body['exampleRadios1'] == 'brand'
      var total_amount = rows1
      res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'brand', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})
      //req.body['exampleRadios1'] == 'category'
      var total_amount = rows1
      res.render('sales_filter.ejs',{is_paramater_set : true, time_type: 'year', filter_type: 'category', display_content: rows, month_name: 'None', year:year, total_amount:total_amount})

   
    
  })

  //View Categories
  app.get('/categories', checkAuthenticated,(req, res) => {
    //Categorias
    var category = rows1
    res.render('categories.ejs', {category:category})
})

//View Brands
//Ver marcas rows 2
var brand = rows2
res.render('brands.ejs',{brand:brand})

  app.get('/brands', checkAuthenticated,(req, res) => {
    
})

//View Sizes
  app.get('/sizes', checkAuthenticated,(req, res) => {
    //Rows2
    var size = rows2
    res.render('sizes.ejs',{size:size})

   
  })

  //View Stocks
  //Obtener Rows3 Rows2 Rows1
  var category = rows1
  var brand = rows2
  var size = rows3
  res.render('stocks.ejs',{category:category, brand:brand, size:size})

  app.get('/stocks', checkAuthenticated,(req, res) => {
    
  })

  //Submit Bill
  //Enviar recibo , redirige a Ordenes la pagina
  app.post('/submitbill', checkAuthenticated,(req, res) => {
    res.redirect('/orders')
    
  })

  //Submit Stock
  //Submit stock redirect  res.redirect('/viewstocks')
  app.post('/submitstock', checkAuthenticated,(req, res) => {
    
  })

  //Delete Order
  res.redirect('/orders')

  app.post('/deleteitem', checkAuthenticated,(req,res) => {
    
  })

  //Delete Category
  res.redirect('/categories')
  app.post('/deletecategory', checkAuthenticated,(req,res) => {
   
  })

  //Delete Brand
  res.redirect('/brands')
  app.post('/deletebrand', checkAuthenticated,(req,res) => {
    
  })

  //Delete Size
  res.redirect('/sizes')
  app.post('/deletesize', checkAuthenticated,(req,res) => {
   
  })

  //Delete Stock
  res.redirect('/viewstocks')

  app.post('/deletestock', checkAuthenticated,(req,res) => {
    
  })