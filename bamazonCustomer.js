const mysql = require("mysql");
const inquirer = require("inquirer");
const inquirer2 = require("inquirer");


const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Password",
    database: "bamazon"
});

connection.connect(err => {
    if (err) throw err;
    mainMenu();
});


// ----------------------------------------------
//      Main Menu Sale Product
//-----------------------------------------------
function mainMenu(){
    inquirer.prompt([{
    type: "list",
    name: "mainmenu",
    message: "What would you like to do?",
    choices: [
        "Show All Products",
        "Buy Product By ID",
        "Quit"
    ]
    }]).then(answer => {

        switch (answer.mainmenu) {
            case "Show All Products": // Show All Product
                showAll();
                break;
            case "Buy Product By ID": // Sale Product By ID
                buyAnItem();
                break;
            default:
                console.log("End Of Purchasing!");
                connection.end();
        }
    });
}

// ----------------------------------------------
//      Show All Products
//-----------------------------------------------
function showAll() {
    connection.query("SELECT * FROM products", (err, response) => {
    if (err) throw err;
    console.log(`\n`);
    console.table( response);
    console.log(`\n Press Arrow Up Down to choose Menu ...\n`);
    });
    mainMenu();
}


// ----------------------------------------------
//      Show One Product By ID
//-----------------------------------------------
function showOneByID(item_id) {
    connection.query(`SELECT * FROM products WHERE item_id="${item_id}"`, (err, response) => {
    if (err) throw err;
    console.log(`\n`);
    console.table( response);
    console.log(`\n Press Arrow Up Down to choose Menu ...\n`);
    });
    mainMenu();

}

// ----------------------------------------------
//      Sale a product by ID
//-----------------------------------------------
function buyAnItem(){
    const checkQTY = (Id,qty) =>{
        connection.query("SELECT * FROM products WHERE item_id = ?", [Id], (err, response) => {
            if (err) throw err;
            if (Object.entries(response).length === 0 )
                console.log("Product ID is wrong!")
            else 
                if (response[0].stock_quantity - qty >= 0){     // ----- CHECK QUANTITY
                    const orderPlaced = response.map(item => {
                        item.qty = Number(qty);
                        item.total = Number((item.price * qty).toFixed(2))
                        return item; 
                    })
                    delete orderPlaced.stock_quantity;
                    delete orderPlaced.department_name;

                    console.table(orderPlaced);
                    inquirer2.prompt([{
                    type: "list",
                    name: "buyIt",
                    message: "Do you agree this purchase?",
                    choices: ["Yes","No"]
                    }]).then(answer => {
                        if (answer.buyIt === "Yes"){
                            console.log("---- Placed Order ----") 
                            // ----- Update Database ------
                                    const saleProduct = response.map(item => {
                                    item.product_sales += (Number((item.price * qty).toFixed(2)));
                                    item.stock_quantity -= Number(qty);
                                    return item;  
                                })
                                connection.query("UPDATE products SET stock_quantity=? , product_sales=? WHERE item_id= ?", [
                                    saleProduct[0].stock_quantity, saleProduct[0].product_sales, saleProduct[0].item_id
                                ], (err, response) => {
                                    if(err) throw err;
                                    mainMenu();
                                });

                        } else 
                            console.log("---- Cancled Order ----") 
                    });

                    console.log(`\n Press Arrow Up Down to choose Menu ...\n`);
                } else{
                    console.log("Quantity not in srock!")
                }
        });
    } 
    inquirer.prompt([{
        type: "input",
        name: "itemId",
        message: "Enter your product Id?"
    },
    {
        type: "input",
        name: "itemQTY",
        message: "Enter QTY of product?"
    }
    ]).then(answer => {
        checkQTY(answer.itemId,answer.itemQTY)
    });
}