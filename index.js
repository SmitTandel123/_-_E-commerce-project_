const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const product = require("./db/product");

const Jwt = require("jsonwebtoken");
const Jwtkey = "E-comm";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/Signup", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, Jwtkey, { expiresIn: "24h" }, (err, token) => {
    if (err) {
      res.send({ result: "Something went wrong, please try again later" });
    }
    res.send({ result, auth: token });
  });
});

app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, Jwtkey, { expiresIn: "24h" }, (err, token) => {
        if (err) {
          res.send({ result: "Something went wrong, please try again later" });
        }
        res.send({ user, auth: token });
      });
    } else {
      res.send({ result: "No such user found" });
    }
  } else {
    res.send({ result: "No such user found" });
  }
});

app.post("/add-product", verifyToken, async (req, res) => {
  try {
    let Product = new product(req.body);
    let result = await Product.save();
    res.send(result);
  } catch (err) {
    res.status(500).json({ err: "An error occured while adding the product" });
  }
});
app.get("/products", verifyToken, async (req, res) => {
  try {
    let products = await product.find();
    if (products.length > 0) {
      res.send(products);
    } else {
      res.send({ result: "No product found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching products" });
  }
});

app.delete("/product/:id", verifyToken, async (req, res) => {
  try {
    const result = await product.deleteOne({ _id: req.params.id });
    res.send(result);
    
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting products via id" });

  }
});

app.get("/product/:id", verifyToken, async (req, res) => {
  try{

    let result = await product.findOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      res.send({ result: "Record not found..." });
    }
  }
  catch(error){
    res.status(500).json({ error: "An error occurred while fetching products via id" });

  }
});
app.put("/product/:id", verifyToken, async (req, res) => {
  try{

    let result = await product.updateOne(
      { _id: req.params.id },
      {
        $set: req.body,
      }
    );
    res.send(result);
  }
  catch(error){
    res.status(500).json({ error: "An error occurred while updating products via id" });

  }
});

app.get("/search/:key", verifyToken, async (req, res) => {
  try{

    let result = await product.find({
      $or: [
        { title: { $regex: req.params.key } },
        { company: { $regex: req.params.key } },
        { description: { $regex: req.params.key } },
      ],
    });
    res.send(result);
  }
  catch(error){
    res.status(500).json({ error: "An error occurred while searching the products" });

  }
});
const userCarts={};
app.post("/add-to-cart/:productId", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const productToAdd = await product.findById(productId);

    if (!productToAdd) {
      return res.status(404).json({ error: "Product not found" });
    }

    const userId = req.user._id.toString(); 
    if (!userCarts[userId]) {
      userCarts[userId] = [];
    }

    const existingCartItem = userCarts[userId].find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity += 1; 
    } else {
      userCarts[userId].push({
        productId: productToAdd._id.toString(),
        title: productToAdd.title,
        price: productToAdd.price,
        quantity: 1,
      });
    }

    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while adding to cart" });
  }
});

app.get("/cart", verifyToken, (req, res) => {
  const userId = req.user._id.toString(); 
  const userCart = userCarts[userId] || [];

  res.json(userCart);
});


function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, Jwtkey, (err, valid) => {
      if (err) {
        res.status(401).send({ result: "Please provide valid token" });
      } else {
        next();
      }
    });
  } else {
    res.status(403).send({ result: "Please add token with header" });
  }
}

app.listen(5000);
