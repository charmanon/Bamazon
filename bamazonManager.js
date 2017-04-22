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
var viewProducts = function() {
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
    });
  managerView();
};

//Views the products with stock quantities of less than 5
var viewLow = function() {
  connection.query('SELECT * FROM products GROUP BY item_id HAVING stock_quantity < 5' , function(err, res) {
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
  });
  managerView();
};

//Asks the user the ID of the product they want to add inventory to
var addInventory = function() {

  inquirer.prompt([{
  name: "id",
  message: "What is the ID of the product you wanna add inventory to?",
  validate: function(value) {
      if (isNaN(value) === false) {
        return true;
      }
      return false;
    }
  }, {
    name: "quantity",
    message: "How many would you like to add?",
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
    connection.query('SELECT * FROM products WHERE ?', {item_id:id},  function(err, res) {
      quantity = res[0].stock_quantity;
      newQuantity = parseFloat(quantity)+parseFloat(items);
      connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [newQuantity,id], function(err, res) {
      console.log("Added "+ items +" new items");
      });
    }); 
    managerView();
  });
};

//Takes in values from user and inserts into a new row sql database
var addNew = function() {
    inquirer.prompt([{
    name: "productName",
    message: "What is the name of your product?"
    }, 
    {
    name: "dept",
    message: "Which department is it in?",
    },
    {
    name: "price",
    message: "How much does it cost?",
    },
    {
    name: "quantity",
    message: "How many would you like to add?",
    }
  ]).then(function(answers) {
    var productName = answers.productName;
    var dept = answers.dept;
    var price = answers.price;
    var quantity = answers.quantity;
    connection.query('INSERT INTO products SET ?',{product_name:productName, department_name:dept, price:price, stock_quantity:quantity}, function(err, res) {
    });
  managerView();
  });
};

//begins the app by prompting the user to pick an action
var managerView = function() {
  inquirer.prompt([
  {
    type: "list",
    name: "action",
    message: "What do you want to do, Master?",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
  },
]).then(function(answer) {
  // If the user chooses to view products
  if (answer.action === "View Products for Sale") {
    viewProducts();
  }

  // If the user views low inventory
  else if (answer.action === "View Low Inventory"){
    viewLow();
  }

  //Allows the user to add to stock quantity
  else if (answer.action === "Add to Inventory"){
    addInventory();
  }

  //Allows the user to add a new product
  else if (answer.action === "Add New Product"){
    addNew();
  }
  });
};

//starts the app
managerView();

