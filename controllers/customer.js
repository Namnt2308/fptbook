const express = require("express");

const dbHandler = require("../databaseHandler");
const router = express.Router();
router.use(express.static("public"));

router.get("/", async (req, res) => {
  const comic = await dbHandler.searchObjectbyCategory(
    "Book",
    "62572ba5513e4209ef0caece"
  );
  const ITbook = await dbHandler.searchObjectbyCategory(
    "Book",
    "62572bb6513e4209ef0caecf"
  );
  const hotBook = await dbHandler.searchHotBooks();
  const Action= await dbHandler.searchObjectbyCategory(
    "Book",
    "625735817c737dcc7158fc7c"
  );
  if (!req.session.user) {
    res.render("index", { comics: comic, ITbooks: ITbook, hotBook: hotBook,Action:Action });
  } else {
    res.render("index", {
      comics: comic,
      ITbooks: ITbook,
      hotBook: hotBook,
      Action:Action,
      user: req.session.user,
    });
  }
});
router.get("/search", async (req, res) => {
  const comic = await dbHandler.searchObjectbyCategory(
    "Book",
    "62572ba5513e4209ef0caece"
  );
  const ITbook = await dbHandler.searchObjectbyCategory(
    "Book",
    "62572bb6513e4209ef0caecf"
  );
  const Action= await dbHandler.searchObjectbyCategory(
    "Book",
    "625735817c737dcc7158fc7c"
  );
  const searchInput = req.query.searchInput;
  if (isNaN(Number.parseFloat(searchInput)) == false) {
    await SearchObject(
      req,
      searchInput,
      res,
      comic,
      ITbook,
      Action,
      dbHandler.searchObjectbyPrice,
      "Book",
      Number.parseFloat(searchInput),
      " VND"
    );
  } else {
    await SearchObject(
      req,
      searchInput,
      res,
      comic,
      ITbook,
      Action,
      dbHandler.searchObjectbyName,
      "Book",
      searchInput
    );
  }
});

async function SearchObject(
  req,
  searchInput,
  res,
  comic,
  ITbook,
  Action,
  dbFunction,
  collectionName,
  searchInput,
  mess
) {
  const resultSearch = await dbFunction(collectionName, searchInput);
  if (resultSearch.length != 0) {
    if (!req.session.user) {
      res.render("search", {
        searchBook: resultSearch,
        comics: comic,
        ITbooks: ITbook,
      });
    } else {
      res.render("search", {
        searchBook: resultSearch,
        comics: comic,
        ITbooks: ITbook,
        Action:Action,
        user: req.session.user,
      });
    }
  } else {
    if (!req.session.user) {
      const message = "Not found " + searchInput + mess;
      res.render("search", {
        comics: comic,
        ITbooks: ITbook,
        Action:Action,
        errorSearch: message,
      });
    } else {
      const message = "Not found " + searchInput + mess;
      res.render("search", {
        comics: comic,
        ITbooks: ITbook,
        Action:Action,
        errorSearch: message,
        user: req.session.user,
      });
    }
  }
}

router.get("/details", async (req, res) => {
  const id = req.query.id;
  const result = await dbHandler.getDocumentById(id, "Book");
  const category = await dbHandler.getDocumentById(result.category, "Category");
  if (!req.session.user) {
    res.render("product_Detail", { details: result, category: category });
  } else {
    res.render("product_Detail", {
      details: result,
      category: category,
      user: req.session.user,
    });
  }
});

module.exports = router;
