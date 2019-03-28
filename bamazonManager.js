const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Password",
    database: "bamazon"
});

connection.connect(err => {
    if (err) throw err;
    runMenu();
});


function runMenu(){
    console.log("--------- Mange Product ---------")
    inquirer.prompt([{
    type: "list",
    name: "mainMenu",
    message: "What would you like to do?",
    choices: [
        "View Products for Sale",
        "View Low Inventory less than 5",
        "Add to Inventory",
        "Add New Product",
        "Quit"
    ]
    }]).then(answer => {

        switch (answer.mainMenu) {
            case  "View Products for Sale":
                showAll();
                break;
            case "View Low Inventory less than 5":
                showLowInv();
                break;
            case "Add to Inventory":
                addInv();
                break;
            case "Add New Product":
                addProduct();
                break;
            default:
                console.log("End Of Managing");
                connection.end();
        }


    });

}


function showAll() {
    connection.query("SELECT * FROM products", (err, response) => {
    if (err) throw err;
    console.log(`\n`);
    console.table( response);
    console.log(`\n Press Arrow Up Down to choose Menu ...\n\n\n`);
    });
    runMenu();
}

function showLowInv() {
    connection.query("SELECT * FROM products where stock_quantity < 5", (err, response) => {
        if (err) throw err;
        console.log(`\n`);
        console.table( response);
        console.log(`\n Press Arrow Up Down to choose Menu ...\n\n\n`);
        });
        runMenu();
}


function addInv() {
    inquirer.prompt([
        {
            name: "id",
            message: "select id for add inventory",
            type: "input"
        },
        {
            name: "value",
            message: "What value do you want to add?",
            type: "input"
        }
    ]).then(answers => {
        connection.query(`UPDATE products SET stock_quantity = stock_quantity + ${answers.value} WHERE item_id= ${answers.id}` , (err, response) => {
            if(err) throw err;
            runMenu();
        });
    })
}


function addProduct() {
    inquirer.prompt([
        {
            type: "input",
            name: "product_name",
            message: "What is the name of the product?",
        },
        {
            type: "input",
            name: "department_name",
            message: "What is the department of product?"
        },
        {
            type: "input",
            name: "price",
            message: "How much is price?"
        },
        {
            type: "input",
            name: "stock_quantity",
            message: "How many have in stock?"
        }
    ]).then(answers => {
        connection.query("INSERT INTO products SET ?", answers, (err, response) => {
            if (err) throw err;
            console.log(`Product added: ${answers.name}`);
            runMenu();
        });
    });
    
}
