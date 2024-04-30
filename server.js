const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const moment = require("moment");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
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
    registeredAt: {
        type: Date,
        required: [true, "`registeredAt` is a required field!"],
    },
});
const competitor = mongoose.model("Competitor", competitorSchema);

const getRegisterPage = async (req, res, next) => {
    res.render("register.hbs");
};
const getAdminLogin = async (req, res, next) => {
    let token = req.cookies.techno;

    if (
        token &&
        jwt.verify(token, process.env.secret_str).admin ==
            process.env.admin_verification_str
    ) {
        return res.redirect("/competitors");
    }

    res.render("admin-login.hbs");
};
const verifyAdminLogin = async (req, res, next) => {
    if (req.body.token !== process.env.admin_token)
        return res.render("admin-login.hbs", { err: "This token is invalid!" });

    const token = jwt.sign(
        { admin: process.env.admin_verification_str },
        process.env.secret_str,
        {
            expiresIn: process.env.login_expires,
        }
    );

    res.cookie("techno", token, {
        expires: new Date(Date.now() + parseInt(process.env.login_expires)),
        secure: false,
        httpOnly: false,
    });

    res.redirect("/competitors");
};
const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies.techno;

        if (!token) return res.redirect("/admin");

        const decodedToken = jwt.verify(token, process.env.secret_str);

        if (decodedToken.admin != process.env.admin_verification_str)
            return res.redirect("/admin");

        next();
    } catch (error) {
        res.json(error);
    }
};
const showCompetitors = async (req, res, next) => {
    try {
        const competitors = await competitor.find();

        for (let i = 0; i < competitors.length; i++) {
            competitors[i].registeredAtFormatted = moment(
                competitors[i].registeredAt
            ).format("hh:mm A | DD.MM.YYYY");
        }

        res.render("data.hbs", {
            count: competitors.length,
            data: competitors,
        });
    } catch (error) {
        res.json(error);
    }
};
const addCompetitor = async (req, res, next) => {
    try {
        req.body.registeredAt = Date.now();
        const data = await competitor.create(req.body);
        res.json({ success: true, data });
    } catch (err) {
        console.log(err);
        res.json({ success: false, data: err });
    }
};

app.get("/register", getRegisterPage);
app.get("/admin", getAdminLogin);
app.post("/admin", verifyAdminLogin);
app.get("/competitors", protectRoute, showCompetitors);
app.post("/competitors", addCompetitor);

app.listen(3000);
