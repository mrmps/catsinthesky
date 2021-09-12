
const express = require('express');
const mysql = require('mysql2');
const app = express();
var axios = require('axios');
const { v4: uuidv4 } = require('uuid');
//NOTE: Starter code from https://www.youtube.com/watch?v=EN6Dx22cPRI


app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

const db = mysql.createConnection({
  host: 'your host here',
  user: 'your user here',
  port: 3306,
  database: 'your db',
  password: 'your pw'
});



db.connect((err) => {
  if (err) {
    console.log(err);
  }
  console.log('MySql Connected...');
});

app.get('/api/create_table', (req, res) => {
  db.query('CREATE TABLE added_cats (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))',
    (err, rows, fields) => {
      if (err) throw err;
    });
  db.query('CREATE TABLE added_veges (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))',
    (err, rows, fields) => {
      if (err) throw err;
    });
  // db.query('CREATE TABLE removed_cats (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))', 
  // (err, rows, fields) => {
  //   if (err) throw err;
  //   console.log('Tables not created');
  // });
  db.query('CREATE TABLE removed_veges (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))',
    (err, rows, fields) => {
      if (err) throw err;
    });
  db.query('CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), token VARCHAR(255))',
    (err, rows, fields) => {
      if (err) throw err;
    });
  res.json({
    message: 'tables created'
  })
})

app.get('/api/merged', (req, res) => {
  Promise.all([
    new Promise((resolve, reject) => {
      db.query('SELECT * FROM added_cats', (err, rows, fields) => {
        if (err) throw err;
        catList = []
        for (var i = 0; i < rows.length; i++) {
          catList.push(rows[i].name)
        }
        resolve(catList)
      })
    }),
    new Promise((resolve, reject) => {
      db.query('SELECT * FROM added_veges', (err, rows, fields) => {
        if (err) throw err;
        vegeList = []
        for (var i = 0; i < rows.length; i++) {
          vegeList.push(rows[i].name)
        }
        resolve(vegeList)
      })
    }),
    new Promise((resolve, reject) => {
      db.query('SELECT * FROM removed_veges', (err, rows, fields) => {
        if (err) throw err;
        removeVegeList = []
        for (var i = 0; i < rows.length; i++) {
          console.log(rows[i].name)
          removeVegeList.push(rows[i].name)
          console.log(removeVegeList)
        }
        resolve(removeVegeList)
      })
    })]).then((data) => {
      axios.all([
        axios.get('http://cats-in-the-sky.herokuapp.com/api/cats'),
        axios.get('http://cats-in-the-sky.herokuapp.com/api/veges')
      ])
        .then(axios.spread((cats, veges) => {
          //data0 data1 and data2 are catList vegeList and removeVegeList respectively
          var Matchings = {}
          var catsWithAdditions = [...new Set([...cats.data, ...data[0]])]
          var vegesWithAdditions = [...new Set([...veges.data, ...data[1]])]
          //filter func from https://stackoverflow.com/questions/19957348/remove-all-elements-contained-in-another-array
          console.log(data[2])
          vegesWithAdditions = vegesWithAdditions.filter(function (veg) {
            return !data[2].includes(veg);
          });
          console.log(vegesWithAdditions)
          for (var i = 0; i < catsWithAdditions.length; i++) {
            var cat = catsWithAdditions[i]
            var firstLetterCat = cat[0]
            Matchings[cat] = []
            for (var j = 0; j < vegesWithAdditions.length; j++) {
              var vege = vegesWithAdditions[j]
              var firstLetterVege = vege[0]
              if (firstLetterVege.toLowerCase() === firstLetterCat.toLowerCase()) {
                Matchings[cat].push(vege)
              }
            }
          }
          res.json(Matchings)
        }))
        .catch(err => {
          res.json({
            error: err
          })
        })
    })
})

app.post('/api/add', (req, res) => {
  var cat = req.body.cat
  var vege = req.body.vege
  if (cat && !cat.charAt(0) == cat.charAt(0).toUpperCase()) {
    res.json({
      message: "The cat's name must start with an uppercase letter"
    })
  }
  if (vege && vege.charAt(0) == !vege.charAt(0).toUpperCase()) {
    res.json({
      message: "The vege must start with an uppercase letter"
    })
  }
  if (cat) {
    db.query('INSERT INTO added_cats (name) VALUES (?)', [cat], function (err, rows, fields) {
      if (err) throw err;
    });
  } else if (vege) {
    db.query('INSERT INTO added_veges (name) VALUES (?)', [vege], function (err, rows, fields) {
      if (err) throw err;
    });
    db.query('DELETE FROM removed_veges WHERE name = ?', [vege], function (err, rows, fields) {
      if (err) throw err;
    });
  }
  res.json({
    message: 'data added'
  })
})

//original delete implementation
// app.post('/api/delete', (req, res) => {
//   var vege = req.body.vege
//   if (vege) {
//     db.query('DELETE FROM added_veges WHERE name = ?', [vege], function (err, rows, fields) {
//       if (err) throw err;
//       console.log('Could not delete');
//     });
//     db.query('INSERT INTO removed_veges (name) VALUES (?)', [vege], function (err, rows, fields) {
//       if (err) throw err;
//       console.log('Could not delete');
//     });
//     res.json({
//       status: 'vege deleted'
//     })
//   }
//   res.json({
//     status: 'this vege does not exist'
//   })
// })

//delete with auth
app.post('/api/delete', (req, res) => {
  var vege = req.body.vege
  var token = req.body.token
  try {
    if (vege) {
      db.query('SELECT * FROM users WHERE token = ?', [token], function (err, rows, fields) {
        if (err) {
          throw error;
        }
        else if (rows.length > 0) {
          db.query('DELETE FROM added_veges WHERE name = ?', [vege], function (err, rows, fields) {
            if (err) throw err;
          });
          db.query('INSERT INTO removed_veges (name) VALUES (?)', [vege], function (err, rows, fields) {
            if (err) throw err;
          });
          res.json({
            status: 'vege deleted'
          })
        } else {
          res.json({
            status: 'invalid token'
          })
        }
      });
    } else {
      res.json({
        status: 'please input a valid veggie'
      })
    }
  } catch (err) {
   throw err 
  }

})

app.post('/api/signup', (req, res) => {
  var username = req.body.username
  var password = req.body.pwd
  var uuid = uuidv4()
  db.query('SELECT * FROM users WHERE username = ?', [username], function (err, rows, fields) {
    if (err) throw err;
    if (rows.length === 0) {
      db.query('INSERT INTO users (username, password, token) VALUES (?, ?, ?)', [username, password, uuid], function (err, rows, fields) {
        if (err) throw err;
      });
      res.json({
        status: 'You have signed up!'
      })
    }
    else {
      res.json({
        status: 'This user already exists'
      })
    }
  });
})

app.get('/api/signin', (req, res) => {
  var username = req.body.username
  var password = req.body.pwd
  db.query('SELECT * FROM users WHERE username = ?', [username], function (err, rows, fields) {
    if (err) throw err;
    if (rows.length === 0) {
      console.log('you are not a user');
      res.json({
        error: 'not a user'
      })
    } else {
      if (rows[0].password === password) {
        console.log('correct pw');
        res.json({
          token: rows[0].token
        })
      } else {
        console.log('incorrect pw');
        res.json({
          error: 'incorrect password'
        })
      }
    }
  });
});


const port = 5000;

app.listen(port, () => `Server running on port ${port}`);
