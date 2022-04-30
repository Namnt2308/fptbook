const bcrypt = require("bcryptjs/dist/bcrypt");
const async = require("hbs/lib/async");
const { MongoClient, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const URL =
  "mongodb+srv://tiennam01:23082001@cluster0.n2pwj.mongodb.net/test";
const DATABASE_NAME = "FPTBook-AsmApplication-Group3";

async function getdbo() {
  const client = await MongoClient.connect(URL);
  const dbo = client.db(DATABASE_NAME);
  return dbo;
}

async function insertObject(collectionName, objectToInsert) {
  const dbo = await getdbo();
  const newObject = await dbo
    .collection(collectionName)
    .insertOne(objectToInsert);
  console.log(
    "Gia tri id moi duoc insert la: ",
    newObject.insertedId.toHexString()
  );
}
async function getAllFeedback() {
  const result = await getAll("Feedback");
  result.forEach(
    (e) => (e.timeString = new Date(e.time).toLocaleString("vi-VN"))
  );
  return result;
}

async function searchObjectbyName(collectionName, name) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({ name: { $regex: name, $options: "i" } })
    .toArray();
  return result;
}


async function searchObjectbyPrice(collectionName, price) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({ price: price })
    .toArray();
  return result;
}

async function searchObjectbyCategory(collectionName, category) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({ category: ObjectId(category) })
    .toArray();
  return result;
}

async function getAll(collectionName) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({})
    .sort({ time: -1 })
    .toArray();
  return result;
}

async function deleteDocumentById(collectionName, id) {
  const dbo = await getdbo();
  await dbo.collection(collectionName).deleteOne({ _id: ObjectId(id) });
}

async function deleteDocument(collectionName, objectToDelete) {
  const dbo = await getdbo();
  await dbo.collection(collectionName).deleteOne(objectToDelete)
}

async function getDocumentById(id, collectionName) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .findOne({ _id: ObjectId(id) });
  return result;
}

async function updateDocument(id, updateValues, collectionName) {
  const dbo = await getdbo();
  await dbo
    .collection(collectionName)
    .updateOne({ _id: ObjectId(id) }, updateValues);
}

async function updateCart(userName, updateDict) {
  const dbo = await getdbo();
  await dbo
    .collection("Order")
    .replaceOne({ user: userName }, updateDict, { upsert: true });
}

async function getCart(userName) {
  const dbo = await getdbo();
  const result = await dbo.collection("Order").findOne({ user: userName });
  return result;
}

async function findOne(collectionName, findObject) {
  const dbo = await getdbo();
  const result = await dbo.collection(collectionName).findOne(findObject);
  return result;
}

async function deleteOne(collectionName, deleteObject) {
  const dbo = await getdbo();
  const result = await dbo.collection(collectionName).deleteOne(deleteObject);
  if (result.deletedCount > 0) {
    return true;
  } else {
    return false;
  }
}


async function checkUserRole(nameIn) {
  const dbo = await getdbo();
  const user = await dbo.collection("Users").findOne({ userName: nameIn });
  if (user == null) {
    return -1;
  } else {
    return user.role;
  }
}

async function checkUserLogin(nameIn) {
  const dbo = await getdbo();
  const results = await dbo.collection("Users").findOne({ userName: nameIn });
  if (results) {
    return results;
  } else {
    return -1;
  }
}

async function checkUser(nameIn) {
  const dbo = await getdbo();
  const results = await dbo.collection("Users").findOne({ userName: nameIn });
  if (results != null) {
    return true;
  } else {
    return false;
  }
}

async function saveDocument(collectionName, id, newValue) {
  const dbo = await getDbo();
  await dbo.collection(collectionName).save({ _id: ObjectId(id), newValue });
}



async function searchOderByUser(collectionName, user) {
  const dbo = await getdbo();
  const result = await dbo
    .collection(collectionName)
    .find({ user: user })
    .toArray();
  return result;
}
async function getDocumentByName(collectionName, name) {
  const dbo = await getdbo();
  const result = await dbo.collection(collectionName).findOne({ name: name });
  return result;
}

async function getUser(name) {
  const dbo = await getdbo();
  const result = await dbo.collection("Users").findOne({ userName: name });
  return result;
}

async function searchHotBooks() {
  const dbo = await getdbo();
  const result = await dbo.collection("Book").find({ hot: "true" }).toArray();
  return result;
}
async function SortdownPrice(collectionName) {
  const dbo = await getdbo()
  const results = await dbo.collection(collectionName).find({}).sort({price:-1}).toArray()   
  return results
}
async function SortupPrice(collectionName) {
  const dbo = await getdbo()
  const results = await dbo.collection(collectionName).find({}).sort({price:1}).toArray()   
  return results
}
async function dosearch(condition,collectionName){
  const dbo = await getdbo();
  const searchCondition = new RegExp(condition,'i')
  const results = await dbo.collection(collectionName).find({name:searchCondition}).toArray();
  return results;
}
module.exports = {
  getAllFeedback,
  dosearch,
  SortupPrice,
  getDocumentByName,
  getUser,
  saveDocument,
  searchObjectbyPrice,
  searchObjectbyName,
  insertObject,
  getAll,
  deleteDocumentById,
  getDocumentById,
  updateDocument,
  findOne,
  deleteOne,
  checkUserRole,
  checkUser,
  searchObjectbyCategory,
  updateCart,
  getCart,
  checkUserRole,
  checkUser,
  searchObjectbyCategory,
  checkUserLogin,
  searchOderByUser,
  searchHotBooks,
  deleteDocument,
  SortdownPrice
};
