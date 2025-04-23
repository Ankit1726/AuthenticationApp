import express from "express";
import mongoose from "mongoose";
import { User } from "./Models/USer.js";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const app = express();

cloudinary.config({
  cloud_name: "djedan94x",
  api_key: "888297255138387",
  api_secret: "p8z34EqFFhoteSiUe9zPpqfcfWw",
});

app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Database Connection
mongoose
  .connect(
    "mongodb+srv://ankitguptaag0650960:UBwAjh6snPgojvFs@cluster0.zkdjliz.mongodb.net/",
    {
      DbName: "Auth_Database",
    }
  )
  .then(() => console.log("Mongo DB Connected"))
  .catch((err) => {
    console.log(err);
  });


//  show register ejs
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// create user
app.post("./register", (req, res) => {
  const { name, email, password } = req.body;
});

// show login page
app.get("/", (req, res) => {
  res.render("login.ejs");
});

// create user
app.post("/register", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const { name, email, password } = req.body;

  try {
    const cloudinaryRes = await cloudinary.uploader.upload(file, {
      folder: "NodeJs_Authentication_App",
    });

    let user = await User.create({
      profileImg: cloudinaryRes.secure_url,
      name,
      email,
      password,
    });

    res.redirect("/");  // redirecting to Home Page

    console.log(cloudinaryRes, name, email, password);
  } catch (error) {
    res.send("Error Accure");
  }
});

// login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    console.log("getting user ", user);
    if (!user) res.render("login.ejs", { msg: "User not found" });
    else if (user.password != password) {
      res.render("login.ejs", { msg: "Invalid password" });
    } else {
      res.render("profile.ejs", { user });
    }
  } catch (error) {
    res.send("Error Accure");
  }
});

// all users
app.get("/users", async (req, res) => {
  let users = await User.find().sort({ createdAt: -1 });
  res.render("users.ejs", { users });
});


const port = 3000;
app.listen(port, () => {
  console.log(`server is runnig  on port ${port}`);
});
