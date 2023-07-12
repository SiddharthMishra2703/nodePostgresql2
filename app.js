const express = require('express');
const bodyParser = require('body-parser');
const {Parser} = require('json2csv');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.set('views', __dirname + '/views');
app.set('public', __dirname + '/public');

var pg = require('pg');



//enter your sql server details in env file or direct here
const con = new pg.Client(process.env.CON_STRING);

// const con = new pg.Client({
//     host:process.env.HOST,
//     user:process.env.USER,
//     password:process.env.PASSW,
//     database:process.env.DATABASE,
//     port:5432,
//     ssl:true
// });
con.connect(function(error){
    if(error) throw error;
    else console.log('Connected');
});
// con.query(`select * from test`, function(err, result){
//     if(err) throw err;
//     console.log(result.rows);
// });

app.get('/', (req, res) => {
    res.render('login');
});
app.post('/', (req, res) => {
    const item = req.body;
    if(item.auth == 'true'){
        con.query("select order_id, order_date, item, count, weight, requests, user_id from Orderitem", function(err, result){
            if(result.rows){
                result = result.rows;
            }
            if(err) throw err;
            res.render('data', {result:result});
        });
    }else{
        con.query(`select id, name, password from Users where id = '${item.id}'`, function(err, result){
            if(result.rows){
                result = result.rows;
            }
            if(result && result[0] && result[0].password == item.password){
                res.render('form', {name:result[0].name, id:result[0].id});
            }else{
                res.send(`<script>alert('Invalid Credential');window.location.href = "/";s</script>`);
            }
        });
    }
});


app.get('/change-pass', (req, res) => {
    res.render('change-pass');
});
app.post('/change-pass', (req, res) => {
    const item = req.body;
    con.query(`select password from Users where phone_number = '${item.number}'`, function(err, result){
        if(result.rows){
            result = result.rows;
        }
        if(result && result[0]){
            con.query(`update Users set password = '${item.password}' where phone_number = '${item.number}'`, function(err, result){
                res.redirect('/');
            });
        }else{
            res.send(`<script>alert('Invalid Credential');window.location.href = "/change-pass";s</script>`);
        }
    });
});


app.post('/order', (req, res) => {
    let item = req.body;
    con.query(`insert into orderitem (order_date, item, count, weight, requests, user_id) values ('${item.a}', '${item.d}', ${item.e}, '${item.f}', '${item.g}', ${item.b}) `, function(err, result){
        if(err) throw err;
    });
    res.redirect("/");
});

app.post('/download', function(req, res){
    
    con.query("select order_id, order_date, item, count, weight, requests, user_id from Orderitem", function(err, result){
        if(result.rows){
            result = result.rows;
        }
        if(err) throw err;
        const parseObj = new Parser();
        const csv = parseObj.parse(result);
        console.log(csv);
        res.attachment('information.csv');
        res.send(csv);
    });
});


const PORT = process.env.PORT || 3000;

app.listen("3000", function(){
    console.log("Server started at port " + PORT);
});