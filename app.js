// app.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'nimap'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});



//api for catagory

app.get('/showcat', (req, res) => {
  const query = 'select * from categories'
  db.query(query, (err, result) => {
    if (err) {
      throw err
    }
    else {
      res.render('category.ejs',{data:result})
    }
  })


})



app.post('/insert', (req, res) => {
  const name = req.body.categoryName
  const query = `insert into categories (categoryName) values('${name}')`
  db.query(query, (err, result) => {
    if (err) {
      throw err
    }
    else {
      const query = 'select * from categories'
      db.query(query, (err, result) => {
        if (err) {
          throw err
        }
        else {
          res.render('category.ejs',{data:result})
        }
      })
    }
  })
})



app.post('/updatecat/:categoryId',(req,res)=>{
  const id=req.params.categoryId
  const name=req.body.categoryName
  const query=`update categories set categoryName='${name}' where categoryId=${id}`
  db.query(query,(err,result)=>{
    if(err)
    {
      throw err
    }
    else{
      
      const query = 'select * from categories';
      db.query(query, (err, result) => {
        if (err) {
          throw err
        }
        else {
          res.render("category.ejs",{data : result})
        }
      })
      
      
    }
  })
})



// 4, category update for select............
app.get('/update/:categoryId', (req, res) => {
    const id = req.params.categoryId;
    const query = `Select * From categories WHERE categoryId = ${id}`;
  
    db.query(query, (error,result) => {
      if (error) throw error;
       else {
       res.render('updatecategory.ejs',{data : result})
       console.log(result)      
    }
    });
  });


  //5. API for update as select.............
  app.get('/selectupdate/:productId', (req, res) => {
      const id = req.params.productId;
      const query =` Select * From products WHERE productId = ${id}`;
    
      db.query(query, (error,result) => {
        if (error) throw error;
         else {
         res.render('updateproduct.ejs',{data : result})
         console.log(result)      
      }
      });
    });



app.get('/deletecat/:categoryId',(req,res)=>{
  const id=req.params.categoryId
  const query=`delete from categories where categoryId=${id}`  
  db.query(query,(err,result)=>{
    if(err)
    {
      throw err
    }
    else{
      
      const query = 'select * from categories'
      db.query(query, (err, result) => {
        if (err) {
          throw err
        }
        else {
          res.render("category.ejs",{data : result});
        }
      })
      
    }
  })
})



//apis for products

app.get('/getproduct',(req,res)=>{
  const query='select * from products'
  db.query(query,(err,result)=>{
    if(err)
    {
      throw err
    }
    else{
      res.send(result)
    }
  })
})

app.post('/insertproduct', (req, res) => {
 
  const id = req.body.catId;
  const name = req.body.productName;   

  const query = `INSERT INTO products (catId, productName) VALUES (${id}, '${name}')
  `;
  db.query(query, (error, result) => {
    if (error) throw error
     else {
      const query = 'SELECT products.productId, products.productName, categories.categoryId, categories.categoryName FROM products INNER JOIN categories ON products.catId = categories.categoryId';
      db.query(query, (err, result) => {
        if (err) throw err
         else {
          res.render("product.ejs",{data : result});
        }
      });
    }
  });
});




//for updating product
app.post('/updateproduct/:productId', (req, res) => {
  const id = req.params.productId;
  const name= req.body.productName;
  const cid = req.body.catId;
  const query = `UPDATE products SET productName="${name}", catId=${cid} WHERE productId = ${id}`;

  db.query(query, (error,results) => {
    if (error) throw error;
     else {

        const query = 'SELECT products.productId, products.productName, categories.categoryId, categories.categoryName FROM products INNER JOIN categories ON products.catId = categories.categoryId';
        db.query(query, (err, result) => {
          if (err) throw err
           else {
            res.render("product.ejs",{data : result});
          }
        });
    }
  });
});


app.get('/deleteproduct/:productId',(req,res)=>{
    const id = req.params.productId;
    const query = `DELETE FROM products WHERE productId = ${id}`;
  
    db.query(query, (err,result) => {
      if (err) throw err
       else {
        const query = 'SELECT products.productId, products.productName, categories.categoryId, categories.categoryName FROM products INNER JOIN categories ON products.catId = categories.categoryId';
        db.query(query, (err, result) => {
          if (err) throw error
           else {
            res.render("product.ejs",{data : result});
          }
        }); 
        }
    });
  });





//for rendering  update categeorypage
app.get('/updatecategorypage',(req,result)=>{
  result.render('category.ejs',{data:result })
})

//for rendering to update productpage
app.get('/updateproductpage',(req,result)=>{
  result.render('product.ejs',{data : result})
})

app.get('/main',(req,result)=>{
  result.render('main.ejs')
})

app.get('/home',(req,result)=>
{
  result.render('main.ejs')
})


// 2. API to fetch Product......................
app.get('/fetch', (req, res) => {
  const query = 'SELECT products.productId, products.productName, categories.categoryId, categories.categoryName FROM products INNER JOIN categories ON products.catId= categories.categoryId';

  db.query(query, (err, results) => {
    if (err) throw err
     else {
      res.render("showall.ejs",{data : results});
    }
  });
});





//pagination

app.get('/pagination/:pageNumber', (req, res) => {
  const pageSize = 10;
  const pageNumber = req.query.pageNumber || 1;
  const offset = (pageNumber - 1) * pageSize;

  const query = `
    SELECT products.productId, products.productName, categories.categoryId, categories.categoryName
    FROM products
    INNER JOIN categories ON products.catId = categories.categoryId
    LIMIT ${pageSize} OFFSET ${offset};
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    
    const totalRecords = 100; 
    const totalPages = Math.ceil(totalRecords / pageSize);

    res.render('showall.ejs', { data: results, totalPages });
  });
});






// Similar routes for adding, updating, and deleting products

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});