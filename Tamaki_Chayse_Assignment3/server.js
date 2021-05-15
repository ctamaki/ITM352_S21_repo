var express = require('express'); // loads the express module
var app = express(); // sets and starts the app module
var myParser = require("body-parser"); // loads the bpdy-parser module
var queryString = require('query-string');
var data = require('./static/product_data.js'); // Links the products page file and sets the the variable to 'data
const qs = require('qs'); // makes qs as the loaded query string module
var products = data.products; // loads the products page to the variable 'products'
var filename = 'user_data.json'; // new variable to the user data file 
var fs = require('fs'); // loads the file system
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');
var nodemailer = require('nodemailer');




app.get('/set_cookie', function (req, res, next) {
    // console.log(request.cookies);
    let my_name = 'Chayse Tamaki';
    //res.clearCookie('my_name');
    //now = new Date();
    res.clearCookie('my_name');
    res.send(`Cookie for ${my_name} sent`);
    next();
});

app.get('/use_cookie', function (req, res, next) {
    //console.log(req.cookie);
    if (typeof req.cookies["username"] != 'undefined') {
        //let username = req.cookies["username"];
        //res.cookie('username', username, {"maxAge": 10*1000});
        res.send(`${req.cookies["username"]} is logged in!`)
    } else {
        res.send("You are not logged in!");
    }
    next();
});

app.use(session({secret: "ITM352 rocks!"}));

if (fs.existsSync(filename)) {
    var filestats = fs.statSync(filename); // gets the stats from the file
    console.log(`${filename} has ${filestats["size"]} characters`); // outputs the characters of the data file
    var data = fs.readFileSync (filename, 'utf-8');
    var user_data = JSON.parse(data);
} else {
    console.log(`${filename} does not exist`)
}

app.all('*', function (req, res, next) { // for all the request methods
    console.log(req.method + ' to ' + req.path); // how the request method gets written in the console and path
    next(); // continue on
});

if(fs.existsSync(filename)) {
    var data = fs.statSync(filename);
    data = fs.readFileSync(filename, 'utf-8');
    var user_data = JSON.parse(data);
} else {
    console.log(`${user_data} does not exist!`);
    exit();
}

// repeats the function from the product_display.html to create a relation between the two pages
function isNonNegInt(q, return_errors = false) {
    errors = []; // assume no errors at first
    if(q=='') q=0;
    if (Number(q) != q) errors.push('NOT A NUMBER!'); // Check if string is a number value
    if (q < 0) errors.push('NEGATIVE VALUE!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('NOT AN INTEGER!'); // Check that it is an integer

    return return_errors ? errors : (errors.length == 0);
}

app.use(myParser.urlencoded({ extended: true })); // get the data in the body
app.use(myParser.json());
app.post("/process_form", function (req, res) {
    params = req.body;

    if (typeof params['purchasesubmit'] != 'undefined') {
        has_errors = false;
        total_qty = 0;
        for (i = 0; i < products.length; i++) {
            if (typeof params [`quantity${i}`] != 'undefined') {
                a_qty = params[`quantity${i}`];
                total_qty += a_qty;
                if (!isNonNegInt(a_qty)) {
                    has_errors = true;
                }
            }
        }

        if (typeof params["purchasesubmit"]) {
            if (has_errors) {
                res.redirect(`./index.html? ${qs.stringify(params)}`);
            } else if (total_qty == 0) {
                res.redirect(`./index.html?${qs.stringifty(params)}`);
            } else {
                req.session[cartfile] = `${qs.stringify(params)}`;
                if (typeof req.cookies["username"] != 'undefined') {
                    res.redirect(`./invoice.html?${qs.stringify(params)}`);
                } else {
                    res.redirect(`./login.html?${qs.stringify(params)}`);
                }
            }
        }
    }
});

app.post("/addtocart", function (req, res) {
    console.log(req.body);
    item_data = req.body;
    if (isNonNegInt(item_data.quantity)){
        if (typeof req.session.cart == "undefined") {
            req.session.cart = {};
        }
        if (typeof req.session.cart[item_data.product_type] == "undefined") {
            req.session.cart[item_data.product_type] = [];
        }
        if (typeof req.session.cart[item_data.product_type][item_data.product_index] == "undefined") {
            req.session.cart[item_data.product_type][item_data.product_index] = 0;
        }
        req.session.cart[item_data.product_type][item_data.product_index] += parseInt(item_data.quantity);
        res.send (`ADDED ${item_data.quantity} ${item_data.product_type} TO YOUR CART!`);
        console.log(req.session.cart);
    } else {
        res.send(`INVALID QUANTITY`);
    }

});

app.post("/loadcart", function (req, res) {
    if (typeof req.session.cart == "undefined") {
        req.session.cart = {};
    }
    res.json(req.session.cart)
});



app.get("/logout", function (req, res) {
    res.clearCookie('username');//clears the cookie of username that we requested from the server when logging in or registering
    str = `<script>alert("${req.cookies['username']} is logged out"); location.href="./index.html";</script>`; //save the script value of the user is logged out and redirect to a variable to so when the user logs out it will run this script to logout and redirect
    res.send(str); //sends the variable
    req.session.destroy(); // finally destroys session with cart info if use had items in card and cookie

});

app.post("/process_login", function (req, res) {
    var LogError =[];
    var theusername = req.body.username.toLowerCase();
    if (typeof user_data[theusername] != "undefined") {
        if (user_data[theusername].password == req.body.password) {
            req.query.username = theusername;
            req.query.name = user_data[req.query.username].name
            res.cookie('username', theusername);
            res.redirect('./index.html');
            return;
        } else {
            req.query.username = theusername;
            req.query.name = user_data[theusername].name;
            req.query.LogError = LogError.join(';');
        }
    } else {
        LogError.push ('USERNAME INVALID');
        req.query.LogError = LogError.join(';');
    }
    res.redirect('./login.html?' + queryString.stringify(req.query));
});

app.post('/process_register', function (req, res) {
    let POST = req.body;
    var errors = [];
    if (/^[A-Za-z]+$/.test(POST['name'])) {
    } else {
        errors.push('ONLY USE LETTERS');
    }
    if ((/.{3,10}/.test(POST['username'])) && (/^[a-zA-Z0-9]*$/.test(POST['username']))) {
    } else {
        errors.push('USERNAME LENGTH: MIN 4 MAX 10');
    }
    var reguser = POST['username'].toLowerCase();
    if (typeof user_data[reguser] != "undefined") {
        errors.push('USERNAME TAKEN');
    }
    if (POST['password'].length < 6) {
        errors.push('PASSWORD TOO SHORT');
    }
    if (POST['password'] != POST['repeat_password']) {
        errors.push('PASSWORDS DO NOT MATCH');
    }

    if (errors.length == 0) {
        var username = POST["username"];
        user_data[username] = {};
        user_data[username].username = POST['username'];
        user_data[username].name = POST['fullname'];
        user_data[username].password = POST['password'];
        user_data[username].email = POST['email'];
        user_data[username].visits = 0;
        user_data[username].register = getMonth()/getDate()/getFullYear();
        data = JSON.stringify(user_data);
        fs.writeFileSync(filename, data, "utf-8");
        theusername = user_data['name'];
        theemail = user_data[username]['email'];
        res.redirect('./login.html');
    } 
    else {
        if (errors.length > 0) {
            req.query.errors = errors.join (';');
            res.redirect('./registration.html?' + qs.stringify(req.query));
        }
    }
});


app.post("/checkout", function (request, response) {
    var user = request.cookies['username'];
    var invoice_str = decodeURI(request.body.invoicestring);
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'theaxolotlshop808@gmail.com',
            pass: 'I<3axolotls'
        }
    }); 
    var user_email = user_data[user].email;
    var mailOptions = {
        from: 'theaxolotlshop808@gmail.com',
        to: user_email,
        subject: 'THE AXOLOTL SHOP: Your order has been recieved',
        html: invoice_str
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            invoice_str += 'OH NO, SOMETHING WENT WRONG';
        } else {
            invoice_str += 'EMAIL WAS SENT, THANK YOU FOR SHOPPING WITH US!';
        }
        request.session.destroy(); //destroys session
        response.send(invoice_str);
    });
});


app.use(express.static('./static')); // creates static server using express from the static folder
app.listen(8080, () => console.log(`listening on port 8080`));