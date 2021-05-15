const querystring = require('querystring');
var express = require('express'); // express helps to handle multiple http requests, code for server
var myParser = require("body-parser"); //code for server
var products = require("./public/product_data.js"); // require data from javascript file
var filename = 'user_data.json';
var app = express();
var qs = require('querystring');
var querystr = {};
var axolotl_quantity = {};

// if values are valid go to invoice, if not, redirect back to shop section
app.get("/process_page", function (request, response) {
   //check for valid quantities
   //look up request.query
   axolotl_quantity = request.query;
   params = request.query;
   console.log(params);
   if (typeof params['checkout_submit'] != 'undefined') {
      has_errors = false; // assume that quantity values are valid
      total_qty = 0; // see if total is greater than 0
      for (i = 0; i < products.length; i++) {
         if (typeof params[`quantity${i}`] != 'undefined') {
            a_qty = params[`quantity${i}`];
            total_qty += a_qty;
            if (!isNonNegInt(a_qty)) {
               has_errors = true; // see if there is invalid data
            }
         }
      }
      querystr = querystring.stringify(request.query);
      // redirect to invoice if quantity data is valid or respond to invalid data
      if (has_errors || total_qty == 0) {
         //redirect to products page if quantity data is invalid
         querystr = querystring.stringify(request.query);
         response.redirect("index.html?" + querystr);
      } else { // quantities entered is valid, send to invoice.html
         response.redirect("login.html?" + querystr);
      }
   }
});

function isNonNegInt(q, returnErrors = false) {
   errors = []; // assume that quantity data is valid 
   if (q == "") { q = 0; }
   if (Number(q) != q) errors.push('Not a number!'); // check if value is a number
   if (q < 0) errors.push('Negative value!'); // check if value is a positive number
   if (parseInt(q) != q) errors.push('Not an integer!'); // check if value is a whole number
   return returnErrors ? errors : (errors.length == 0);
}

fs = require('fs'); // files system module

if (fs.existsSync(filename)) {
   stats = fs.statSync(filename)

   data = fs.readFileSync(filename, 'UTF-8');
   console.log(typeof data);
   users_reg_data = JSON.parse(data);
}

// processes login page
app.get("/login.html", function (request, response) {
   str = `
   <html>
   <head>
   <title>Login</title>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <!--Links to stylesheets from w3schools template-->
   <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
   <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inconsolata">
   <!--Links to stylesheet similar to SmartPhoneProducts-->
   <link rel="stylesheet" href="./indexstyle.css">
   </head>
   <body>
     <!-- Navigation Bar at Top -->
     <div class="w3-top">
       <div class="w3-row w3-padding w3-black">
         <!--Creates HOME element on navigation bar and links it to proper section-->
         <div class="w3-col s3">
           <a href="./index.html" class="w3-button w3-block w3-black">HOME</a>
         </div> 
         <!--Creates ABOUT element on navigation bar and links it to proper section-->
         <div class="w3-col s3">
           <a href="./index.html#about" class="w3-button w3-block w3-black">ABOUT</a>
         </div>
         <!--Creates OUR AXOLOTLS element on navigation bar and links it to proper section-->
         <div class="w3-col s3">
           <a href="./index.html#productdisplay" class="w3-button w3-block w3w-black">OUR AXOLOTLS</a>
         </div>
         <!--Creates CHECKOUT element on navigation bar and links it to proper section-->
         <div class="w3-col s3">
           <a href="./index.html#checkout" class="w3-button w3-block w3-black">CHECKOUT</a>
         </div>
       </div>
     </div>
   
     <!-- Header with image -->
     <!--Assigns this section to HOME-->
     <header class="bgimg2 w3-display-container w scale-min" id="home">
       <div class="w3-display-bottomleft w3-center w3-padding-large w3-hide-small">
           <span class="w3-tag"><span style= "color:rgb(255, 101, 101)">Attention!:</span> Using the navigation bar (above) from this page will restart your order</span>
         </div>
       <!--Diplays a title on the page-->
       <div class="w3-display-middle w3-center">
         <h5 class="w3-center w3-padding-64" style="font-size: 80px"><span class="w3-tag w3-wide">ACCOUNT LOGIN</span>
         </h5>
       </div>
     </header>
     
     <body>
       <div style="text-align: center;height:400px" class="w3-sand w3-grayscale w3-large";>
   
           <form name="loginform" action="?${qs.stringify(request.query)}" method="POST">
               <div>
                   <input type="text" name="username" size="40" placeholder="username" style="margin-bottom: 2%;margin-top: 5%;"><br />
                   <input type="password" name="password" size="40" placeholder="password" style="margin-bottom: 2%;"><br/>
                   <input type="submit" value="Login" id="submit"> </div>
           </form>
       </body>
       
       <br>
   
   
       <h3>Click below to create an account</h3>
       <body>
       <div>
           <form action="./registration.html">
           <input type="submit" class="button" value="Create Account" id="regpage" name="register_here" style="margin-bottom: 5%;">
           </form>
       </div>
       </body>
       </html>
`;
response.send(str);
      });

app.post("/login.html", function (request, response) {
         // processes the login form POST and redirects to invoice page if valid, goes back to login page if not valid
         console.log(axolotl_quantity);
         the_username = request.body.username;
         console.log(the_username, "Username is", typeof (users_reg_data[the_username]));
         // validate login data
         if (typeof users_reg_data[the_username] != 'undefined') {
            // checks if the username exists in the json data
            if (users_reg_data[the_username].password == request.body.password) {
               // make the query string of product quantity needed for the invoice
               theQuantQuerystring = qs.stringify(axolotl_quantity);
               response.redirect('/invoice.html?' + qs.stringify(request.query) + `&username=${the_username}`);
             
            } else {
               response.redirect('./login.html?' + qs.stringify(request.query));
               
            }
         }
      });

      app.get("/registration.html", function (request, response) {
         // process registration form
         str = `
         <!DOCTYPE html>
<html>
<head>
<title>Registration</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!--Links to stylesheets from w3schools template-->
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inconsolata">
<!--Links to stylesheet similar to SmartPhoneProducts-->
<link rel="stylesheet" href="./indexstyle.css">
<script>src = "server.js"</script>
</head>
<body>
  <!-- Navigation Bar at Top -->
  <div class="w3-top">
    <div class="w3-row w3-padding w3-black">
      <!--Creates HOME element on navigation bar and links it to proper section-->
      <div class="w3-col s3">
        <a href="./index.html" class="w3-button w3-block w3-black">HOME</a>
      </div>
      <!--Creates ABOUT element on navigation bar and links it to proper section-->
      <div class="w3-col s3">
        <a href="./index.html#about" class="w3-button w3-block w3-black">ABOUT</a>
      </div>
      <!--Creates OUR AXOLOTLS element on navigation bar and links it to proper section-->
      <div class="w3-col s3">
        <a href="./index.html#productdisplay" class="w3-button w3-block w3w-black">OUR AXOLOTLS</a>
      </div>
      <!--Creates CHECKOUT element on navigation bar and links it to proper section-->
      <div class="w3-col s3">
        <a href="./index.html#checkout" class="w3-button w3-block w3-black">CHECKOUT</a>
      </div>
    </div>
  </div>
  <!-- Header with image -->
  <!--Assigns this section to HOME-->
  <header class="bgimg3 w3-display-container w3-grayscale-min" id="home">
    <div class="w3-display-bottomleft w3-center w3-padding-large w3-hide-small">
      <span class="w3-tag"><span style="color:rgb(255, 101, 101)">Attention!:</span> Using the navigation bar (above)
        from this page will restart your order</span>
    </div>
    <!--Diplays a title on the page-->
    <div class="w3-display-middle w3-center">
      <h5 class="w3-center w3-padding-64" style="font-size: 80px"><span class="w3-tag w3-wide">REGISTRATION BELOW</span>
      </h5>
    </div>
  </header>
  <body>
    <div style="text-align: center;height:500px" class="w3-sand w3-grayscale w3-large">
      <!--textboxes for registration input. pattern specifies what characters are necessary for given textboxes.-->
      <div class="card">
        <form method="POST" action="?${qs.stringify(request.query)}" onsubmit=validatePassword()>
          <input type="text" name="fullname" size="40" pattern="[a-zA-Z]+[ ]+[a-zA-Z]+" maxlength="30"
            placeholder="First & Last Name" style="margin-bottom: 2%;margin-top: 5%;"><br />
          <input type="text" name="username" size="40" pattern=".[a-z0-9]{3,10}" required
            title="Minimum 4 Characters, Maximum 10 Characters, Numbers/Letters Only" placeholder="Username" style="margin-bottom: 2%;"><br />
          <input type="email" name="email" size="40" placeholder="Email" pattern="[a-z0-9._]+@[a-z0-9]+\.[a-z]{3,}$"
            required title="Please enter valid email." style="margin-bottom: 2%;"><br />
          <input type="password" id="password" name="password" size="40" pattern=".{8,}" required
            title="8 Characters Minimum" placeholder="Password" style="margin-bottom: 2%;"><br />
          <input type="password" id="repeat_password" name="repeat_password" size="40" pattern=".{8,}" required
            title="8 Characters Minimum" placeholder="Repeat Password" style="margin-bottom: 2%;"><br />
          <input type="submit" value="Register" id="submit">
          <h5 class="w3-center w3-padding-64"><span class="w3-tag w3-wide">"You axolotl journey starts here!"</span></h5>
        </form>
      </div>
    </div>
  </body>
</html>
         `;
         response.send(str);
               });

               app.post("/registration.html", function (request, response) {
                  // process a simple registration form
                  console.log(axolotl_quantity);
                  the_username = request.body.username;
                  console.log(the_username, "Username is", typeof (users_reg_data[the_username]));
               
                  username = request.body.username;// save new user to file name (users_reg_data)
               
                  errors = [];// checks if username already exists
               
                  if (typeof users_reg_data[username] != 'undefined') {
                     errors.push("Please choose a different Username");
                  }
                  
                  if (request.body.password !== request.body.repeat_password) {
                    errors.push('Passwords do not match')
                  }
               
                  console.log(errors, users_reg_data);
               
                  if (errors.length == 0) {
                     users_reg_data[username] = {};
                     users_reg_data[username].username = request.body.username
                     users_reg_data[username].password = request.body.password;
                     users_reg_data[username].email = request.body.email;
               
                     theQuantQuerystring = qs.stringify(axolotl_quantity);
                     fs.writeFileSync(filename, JSON.stringify(users_reg_data));
                     response.redirect("/invoice.html?" + qs.stringify(request.query) + `&username=${the_username}`);
                     
               
                  }
               });
               
               
               app.all('*', function (request, response, next) {
                  console.log(request.method + ' to ' + request.path);
                  next();
               });

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));