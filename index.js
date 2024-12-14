// Import dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connection from "./config/database.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/view")));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());

// Routes

// Redirect to index
app.get("/", (req, res) => {
  res.redirect("index.html");
});

// Create
app.post("/index.html", (req, res) => {
  console.log(req.body);

  const name = req.body.name;
  const email = req.body.email;

  try {
    connection.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email],
      (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/data");
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

// Read
app.get("/data", (req, res) => {
  connection.query("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      res.render("read.ejs", { rows });
    }
  });
});

// Update: Render update form
app.get("/update-data", (req, res) => {
  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [req.query.id],
    (err, eachRow) => {
      if (err) {
        console.log(err);
      } else {
        const result = JSON.parse(JSON.stringify(eachRow[0]));
        console.log(result);
        res.render("edit.ejs", { result });
      }
    }
  );
});

// Update: Final update action
app.post("/final-update", (req, res) => {
  const id = req.body.hidden_id;
  const name = req.body.name;
  const email = req.body.email;

  console.log("ID:", id);

  const updateQuery = "UPDATE users SET name = ?, email = ? WHERE id = ?";

  try {
    connection.query(updateQuery, [name, email, id], (err, rows) => {
      if (err) {
        res.send(err);
      } else {
        res.redirect("/data");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// Delete
app.get("/delete-data", (req, res) => {
  const deleteQuery = "DELETE FROM users WHERE id = ?";

  connection.query(deleteQuery, [req.query.id], (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/data");
    }
  });
});

// Start server
app.listen(process.env.PORT || 3000, function (err) {
  if (err) console.log(err);
  console.log(`Listening to port ${process.env.PORT}`);
});
