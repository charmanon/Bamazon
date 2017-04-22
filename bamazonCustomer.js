var mysql = require("mysql");
var Table = require('cli-table');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Cano1290",
  database: "Bamazon"
});

var id;
var quantity;
var price;
var newQuantity;
var items;


//updates the stock in the database
//subtracts the amount ordered by the user
var buyItems = function() {
          newQuantity = quantity - items; 
          connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [newQuantity,id], function(err, res) {
          });
};


// runs inquirer and asks the user a series of questions whose replies are
// stored within the variable answers inside of the .then statement.
var productSearch = function() {
  //shows table of products
  connection.query('SELECT * FROM products', function(err, res) {
      if(err) throw err;
      
      // instantiate new table from cli-table package
      var table = new Table({
          head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity']
        , colWidths: [10, 20, 20, 10, 18]
      });
      
      //goes through the res object and pushes the data into the table
      for (var i = 0; i < res.length ; i++){
          table.push(
          [res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].price, res[i].stock_quantity]
        );
      }

      //prints the table to console
      console.log("\n" + table.toString() + "\n");

  inquirer.prompt([{
    name: "id",
    message: "What is the ID of the product you wanna buy?",
    validate: function(value) {
      if (isNaN(value) === false) {
        return true;
      }
      return false;
    }
  }, {
    name: "quantity",
    message: "How many would you like to buy?",
    validate: function(value) {
      if (isNaN(value) === false) {
        return true;
      }
      return false;
    }
  }
  ]).then(function(answers) {
    id = answers.id;
    items = answers.quantity;
    var price;
    var query = "SELECT stock_quantity, price FROM products WHERE?";

    connection.query(query, {item_id:id}, function(err, res) {
        if (res[0].stock_quantity < items){
          console.log("Not enough in stock!!");
          productSearch();
        }
        else {
          price = res[0].price;
          quantity = res[0].stock_quantity;
          console.log("The cost of your order is: $" + items*price);  
          buyItems();
          productSearch();
        }
      });
    });
  });
};

productSearch();


