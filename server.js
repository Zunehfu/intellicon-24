const express = require("express");
const Database = require("better-sqlite3");
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

const db = new Database("server.db", { verbose: console.log });

const sql_tables = `
    CREATE TABLE IF NOT EXISTS competitors(
        id INTEGER PRIMARY KEY, 
        firstName TEXT NOT NULL, 
        lastName TEXT NOT NULL, 
        email TEXT NOT NULL UNIQUE, 
        category TEXT NOT NULL, 
        institute TEXT, 
        contact TEXT NOT NULL, 
        address TEXT NOT NULL, 
        registeredAtObject TEXT NOT NULL, 
        registeredAtFormatted TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions(
        id INTEGER PRIMARY KEY, 
        name TEXT NOT NULL, 
        contact TEXT NOT NULL, 
        email TEXT NOT NULL, 
        question TEXT NOT NULL, 
        additionalInfo TEXT,
        askedAtObject TEXT,
        askedAtFormatted TEXT
    );
`;

db.exec(sql_tables);

const stmt__insert__tbl_competitors = db.prepare(
    `INSERT INTO competitors(
        firstName, 
        lastName, 
        email, 
        category, 
        institute, 
        contact, 
        address, 
        registeredAtObject, 
        registeredAtFormatted
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const stmt__insert__tbl_questions = db.prepare(
    `INSERT INTO questions(
        name, 
        contact, 
        email, 
        question, 
        additionalInfo, 
        askedAtObject, 
        askedAtFormatted
    ) VALUES(?, ?, ?, ?, ?, ?, ?)`
);
const stmt__getall__tbl_competitors = db.prepare("SELECT * FROM competitors");
const stmt__getall__tbl_questions = db.prepare("SELECT * FROM questions");
const stmt__get__tbl_competitors = db.prepare(
    "SELECT * FROM competitors WHERE id = ?"
);
const stmt__get__tbl_questions = db.prepare(
    "SELECT * FROM questions WHERE id = ?"
);

const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies.techno;

        if (!token) return res.redirect("/admin");

        const decodedToken = jwt.verify(token, process.env.secret_str);

        if (decodedToken.admin != process.env.admin_verification_str)
            return res.redirect("/admin");

        next();
    } catch (error) {
        console.log("Err: protectRoute ---------------");
        console.log(err);
        console.log("---------------------------------");
        res.json(error);
    }
};
const getAdminLogin = async (req, res, next) => {
    try {
        let token = req.cookies.techno;

        if (
            token &&
            jwt.verify(token, process.env.secret_str).admin ==
                process.env.admin_verification_str
        ) {
            return res.redirect("/competitors");
        }

        res.render("admin-login.hbs");
    } catch (err) {
        console.log("Err: getAdminLogin ---------------");
        console.log(err);
        console.log("----------------------------------");
    }
};
const verifyAdminLogin = async (req, res, next) => {
    try {
        if (req.body.token !== process.env.admin_token)
            return res.render("admin-login.hbs", {
                err: "This token is invalid!",
            });

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
    } catch (err) {
        console.log("Err: verifyAdminLogin --------------");
        console.log(err);
        console.log("------------------------------------");
    }
};
const showCompetitors = async (req, res, next) => {
    try {
        const competitors = stmt__getall__tbl_competitors.all();

        res.render("competitors.hbs", {
            count: competitors.length,
            data: competitors,
        });
    } catch (error) {
        console.log("Err: showCompetitors ------------");
        console.log(err);
        console.log("---------------------------------");
        res.json(error);
    }
};
const showQuestions = async (req, res, next) => {
    try {
        const questions = stmt__getall__tbl_questions.all();

        res.render("questions.hbs", {
            count: questions.length,
            data: questions,
        });
    } catch (error) {
        console.log("Err: showQuestions ----------------");
        console.log(err);
        console.log("---------------------------------");
        res.json(error);
    }
};
const addCompetitor = async (req, res, next) => {
    try {
        console.log("-- New competitor registration request recieved");
        console.log(
            "\n==================================================== start"
        );
        console.log("-- request object --");
        console.log(req.body);

        const dateObj = new Date();
        req.body.registeredAtObject = dateObj.toISOString();
        req.body.registeredAtFormatted = moment(dateObj).format(
            "hh:mm A | DD.MM.YYYY"
        );

        console.log("-- modified request object --");
        console.log(req.body);
        console.log("-- SQLite query --");

        const result = stmt__insert__tbl_competitors.run(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.category,
            req.body.institute,
            req.body.contact,
            req.body.address,
            req.body.registeredAtObject,
            req.body.registeredAtFormatted
        );
        const data = stmt__get__tbl_competitors.get(result.lastInsertRowid);

        console.log("-- fetch response object --");
        console.log({ success: true, data });
        console.log(
            "==================================================== end\n"
        );

        res.json({ success: true, data });
    } catch (err) {
        console.log("Err: addCompetitor ------------");
        console.log(err);
        console.log("---------------------------------");
        res.json({ success: false, data: err });
    }
};
const getRegisterPage = async (req, res, next) => {
    try {
        res.render("register.hbs");
    } catch (err) {
        console.log("Err: getRegisterPage ---------------");
        console.log(err);
        console.log("------------------------------------");
    }
};
const addQuestion = async (req, res, next) => {
    try {
        console.log("** New Question adition request recieved");
        console.log(
            "\n==================================================== start"
        );
        console.log("-- request object --");
        console.log(req.body);

        const dateObj = new Date();
        req.body.askedAtObject = dateObj.toISOString();
        req.body.askedAtFormatted = moment(dateObj).format(
            "hh:mm A | DD.MM.YYYY"
        );

        console.log("-- modified request object --");
        console.log(req.body);
        console.log("-- SQLite query --");

        const result = stmt__insert__tbl_questions.run(
            req.body.name,
            req.body.contact,
            req.body.email,
            req.body.question,
            req.body.additionalInfo,
            req.body.askedAtObject,
            req.body.askedAtFormatted
        );
        const data = stmt__get__tbl_questions.get(result.lastInsertRowid);

        console.log("-- fetch response object --");
        console.log({ success: true, data });
        console.log(
            "==================================================== end\n"
        );

        res.json({ success: true, data });
    } catch (err) {
        console.log("Err: addQuestion ----------------");
        console.log(err);
        console.log("---------------------------------");
        res.json({ success: false, data: err });
    }
};

// SSR routes ------------------------------------------------------
// Admin only routes
app.get("/admin", getAdminLogin);
app.post("/admin", verifyAdminLogin);
app.get("/competitors", protectRoute, showCompetitors);
app.get("/questions", protectRoute, showQuestions);

// User routes
app.get("/register", getRegisterPage);
app.post("/competitors", addCompetitor);
app.post("/questions", addQuestion);
// -----------------------------------------------------------------

app.listen(process.env.port, (err) => {
    if (err) {
        console.log(
            "Error when starting the server on PORT -> ",
            process.env.port
        );
    } else {
        console.log(
            "Server successfully started on PORT -> ",
            process.env.port
        );
    }
});
