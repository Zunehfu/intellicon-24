const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = express();
app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(express.json());

dotenv.config({ path: "./.env" });

mongoose
    .connect(process.env.connection_str, {
        // useNewUrlParser: true
    })
    .then((conn) => {
        console.log(conn);
        console.log("Database connection established!");
    })
    .catch((err) => {
        console.log(err);
        console.log("There is an issue with database connection!");
    });

const competitorSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: [true, "`fname` is a required field!"],
        trim: true,
    },
    lname: {
        type: String,
        required: [true, "`lname` is a required field!"],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, "`email` is a required field!"],
        trim: true,
    },
    category: {
        type: String,
        required: [true, "`category` is a required field!"],
        trim: true,
    },
    institute: {
        type: String,
        trim: true,
    },
    contact: {
        type: String,
        required: [true, "`contact` is a required field!"],
        trim: true,
    },
    address: {
        type: String,
        required: [true, "`address` is a required field!"],
        trim: true,
    },
});

const competitor = mongoose.model("Competitor", competitorSchema);

app.get("/register", (req, res) => {
    res.render("register.hbs");
});

app.post("/users", async (req, res) => {
    console.log(req.body);

    try {
        const data = await competitor.create(req.body);
        res.json({ success: true, data });
    } catch (err) {
        console.log(err);
        res.json({ success: false, data: err });
    }
});

app.listen(3000);
