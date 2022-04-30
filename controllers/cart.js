const express = require("express");
const async = require("hbs/lib/async");
const dbHandler = require("../databaseHandler");
const router = express.Router();
router.use(express.static("public"));

router.use((req, res, next) => {
  console.log(req.session);
  const { user } = req.session;
  if (user) {
    if (user.role == "Customer") {
      next("route");
    } else {
      res.sendStatus(404);
    }
  } else {
    res.redirect("/login");
  }
});

router.post("/", async (req, res) => {
  const bookID = req.body.bookID;
  const book = await dbHandler.getDocumentById(bookID, "Book");
  const orderDB = await dbHandler.getCart(req.session.user.name);
  if (orderDB == null) {
    let cart = req.session["cart"];
    //chua co gio hang trong session, day se la sp dau tien
    if (!cart) {
      let dict = {
        user: req.session.user.name,
        books: [],
        totalPrice: book.price,
      };
      book.qty = 1;
      book.money = book.price * book.qty;
      dict.books.push(book);
      req.session["cart"] = dict;
    } 
    else {
      dict = req.session["cart"];
      var oldBookIndex = dict.books.findIndex((b) => b._id == book._id);
      if (oldBookIndex == -1) {
        book.qty = 1;
        book.money = book.price * book.qty;
        dict.books.push(book);
      } else {
        const oldBook = dict.books[oldBookIndex];
        oldBook.qty += 1;
        oldBook.money = oldBook.price * oldBook.qty;
      }
      dict.totalPrice += book.price;
      req.session["cart"] = dict;
    }
    await dbHandler.updateCart(req.session.user.name, req.session["cart"]);
    res.redirect("/details?id=" + bookID);
  } 
  else {
    let cart = req.session["cart"];
    if (!cart) {
      let dict = orderDB;
      var oldBookIndex = dict.books.findIndex((b) => b._id == book._id);
      if (oldBookIndex == -1) {
        book.qty = 1;
        book.money = book.price * book.qty;
        dict.books.push(book);
      } else {
        const oldBook = dict.books[oldBookIndex];
        oldBook.qty += 1;
        oldBook.money = oldBook.price * oldBook.qty;
      }
      dict.totalPrice += book.price;
      req.session["cart"] = dict;
    } else {
      dict = req.session["cart"];
      var oldBookIndex = dict.books.findIndex((b) => b._id == book._id);
      if (oldBookIndex == -1) {
        book.qty = 1;
        book.money = book.price * book.qty;
        dict.books.push(book);
      } else {
        const oldBook = dict.books[oldBookIndex];
        oldBook.qty += 1;
        oldBook.money = oldBook.price * oldBook.qty;
      }
      dict.totalPrice += book.price;
      delete dict._id;
      req.session["cart"] = dict;
    }
    await dbHandler.updateCart(req.session.user.name, req.session["cart"]);
    res.redirect("/details?id=" + bookID);
  }
});

router.get("/viewCart", async (req, res) => {
  const cart = req.session["cart"];
  if (cart) {
    res.render("ShoppingCart", { order: cart, user: req.session.user });
  } else {
    const orderDB = await dbHandler.getCart(req.session.user.name);
    if (orderDB == null) {
      res.redirect("/");
    } else {
      res.render("ShoppingCart", { order: orderDB, user: req.session.user });
    }
  }
});
//Thanh toan gio hang
router.post("/pay", async (req, res) => {
  const id = req.body.userOrder;
  const newTotal = Number.parseFloat(req.body.totalPrice);
  let date = new Date();
  const orderDB = await dbHandler.getDocumentById(id, "Order");
  orderDB["time"] = date;
  orderDB["Status"] = "Confirming";
  orderDB["totalPrice"] = newTotal;
  await dbHandler.insertObject("Customer Order", orderDB);
  await dbHandler.deleteDocumentById("Order", id);
  req.session["cart"] = null;
  res.redirect("/shoppingCart/viewCart");
});

router.get("/delete", async (req, res) => {
  const id = req.query.id;
  console.log("id need delete: " + id);
  const orderDB = await dbHandler.getCart(req.session.user.name);
  if (!req.session["cart"]) {
    let dict = orderDB;
    var bookIndex = dict.books.findIndex((b) => b._id == id);
    const bookDelete = dict.books[bookIndex];
    console.log(bookDelete);
    dict.totalPrice -= bookDelete.money;
    dict.books.splice(bookIndex, 1);
    req.session["cart"] = dict;
  } else {
    dict = req.session["cart"];
    var bookIndex = dict.books.findIndex((b) => b._id == id);
    const bookDelete = dict.books[bookIndex];
    dict.totalPrice -= bookDelete.money;
    dict.books.splice(bookIndex, 1);
    delete dict._id;
    req.session["cart"] = dict;
  }
  await dbHandler.updateCart(req.session.user.name, req.session["cart"]);
  res.redirect("/shoppingCart/viewCart");
});

//Hien thi hoa don
router.get("/payCart", async (req, res) => {
  const orderDB = await dbHandler.getCart(req.session.user.name);
  if (orderDB == null) {
    res.redirect("/");
  }
  const tax = orderDB.totalPrice / 100;
  const Total = orderDB.totalPrice + tax;
  res.render("CheckOut", { books: orderDB, tax: tax, Total: Total });
});
//lich su
router.get("/Pushase", async (req, res) => {
  const orderDB = await dbHandler.searchOderByUser(
    "Customer Order",
    req.session.user.name
  );
  console.log(orderDB, req.session.user);
  res.render("Pushase", {
    user: req.session.user,
    orderDB: orderDB,
  });
});

router.get("/productOder", async (req, res) => {
  const orderID = req.query.orderID;
  const orderP = await dbHandler.getDocumentById(orderID, "Customer Order");
  console.log(orderP, req.session.user);
  res.render("productOder", {
    user: req.session.user,
    orderP: orderP,
  });
});

router.get("/viewProfile", async (req, res) => {
  const user = await dbHandler.getUser(req.session.user.name);
  res.render("profile", { user: user });
});

router.get("/updateProfile", async (req, res) => {
  const user = await dbHandler.getUser(req.session.user.name);
  res.render("UpDateProfile", { user: user });
});

router.post("/updateProfile", async (req, res) => {
  const phone = req.body.txtPhone;
  const fullName = req.body.txtName;
  const email = req.body.txtEmail;
  const user = await dbHandler.getUser(req.session.user.name);
  const updateValue = {
    $set: {
      userName: user.userName,
      email: email,
      Name: fullName,
      phone: phone,
      role: user.role,
      password: user.password,
    },
  };
  await dbHandler.updateDocument(user._id, updateValue, "Users");
  res.redirect("/shoppingCart/viewProfile");
});
//xoa cart 
router.get("/Cancel", async (req, res) => {
  const id = req.query.id;
  await dbHandler.deleteDocumentById("Customer Order",id)
  res.redirect("/shoppingCart/Pushase");
});

module.exports = router;
