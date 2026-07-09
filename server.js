const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(__dirname));

// Orders file
const ORDERS_FILE = path.join(__dirname, "orders.json");

// Create orders.json if it doesn't exist
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]");
}

// ================= MENU =================

const menu = [
    {
        id: 1,
        name: "Margherita Pizza",
        price: 650,
        image: "/images/pizza1.jpg"
    },
    {
        id: 2,
        name: "Pepperoni Pizza",
        price: 850,
        image: "/images/pizza2.png"
    },
    {
        id: 3,
        name: "Chicken Supreme",
        price: 950,
        image: "/images/pizza3.jpg"
    },
    {
        id: 4,
        name: "Cheese Burst",
        price: 1100,
        image: "/images/pizza4.jpg"
    },
    {
        id: 5,
        name: "BBQ Pizza",
        price: 1200,
        image: "/images/pizza5.jpg"
    },
    {
        id: 6,
        name: "French Fries",
        price: 350,
        image: "/images/fries.jpg"
    },
    {
        id: 7,
        name: "Fresh Lemon Drink",
        price: 250,
        image: "/images/lemon.jpg"
    }
];

// ================= HOME =================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ================= MENU API =================

app.get("/api/menu", (req, res) => {
    res.json(menu);
});

// ================= PLACE ORDER =================

app.post("/api/order", (req, res) => {

    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));

    const order = {
        id: Date.now(),
        customer: req.body.customer,
        phone: req.body.phone,
        address: req.body.address,
        items: req.body.items,
        total: req.body.total,
        status: "Pending",
        date: new Date().toLocaleString()
    };

    orders.push(order);

    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(orders, null, 4)
    );

    res.json({
        success: true,
        message: "Order placed successfully.",
        order
    });

});

// ================= GET ORDERS =================

app.get("/api/orders", (req, res) => {

    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));

    res.json(orders);

});

// ================= UPDATE STATUS =================

app.put("/api/orders/:id", (req, res) => {

    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));

    const order = orders.find(
        o => o.id == req.params.id
    );

    if (!order)
        return res.status(404).json({
            message: "Order not found"
        });

    order.status = req.body.status;

    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(orders, null, 4)
    );

    res.json(order);

});

// ================= DELETE =================

app.delete("/api/orders/:id", (req, res) => {

    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE));

    orders = orders.filter(
        o => o.id != req.params.id
    );

    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(orders, null, 4)
    );

    res.json({
        success: true
    });

});

// ================= START =================

app.listen(PORT, () => {
    console.log("🍕 PizzaTrack Server Running");
    console.log(`http://localhost:${PORT}`);
});