//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const day = date.getDate();

mongoose.connect("mongodb+srv://admin-part:Test-123@cluster0.qt6f7.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  task: String
});

listSchema = new mongoose.Schema({
  name: String,
  tasks: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const task1 = new Item({
  task: "Welcome to your to-do list"
});
const task2 = new Item({
  task: "Hit + to add a new task"
});
const task3 = new Item({
  task: "<--Hit this to clear a task"
});

const defaultTasks = [task1, task2, task3];


app.get("/", function(req, res) {

  Item.find({}, function(err, tasks) {
    if (tasks.length === 0) {

      Item.insertMany(defaultTasks, function(err) {
        if (!err) {
          console.log("Successfully saved default items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: day, newListItems: tasks});
    }
  });
});


app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    task: itemName
  });

  if (listName === day) {
    item.save(function(err, result){
      res.redirect("/");
    });
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.tasks.push(item);
      foundList.save(function(err, result){
        res.redirect("/" + listName);
      });
    });
  }
});


app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day){
    Item.findByIdAndDelete(itemId, function(err) {
      if (!err) {
        console.log("Successfully deleted the task");
        res.redirect("/");
      }
    });

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {tasks: {_id: itemId}}}, function(err,result){
      if (!err) {
        res.redirect("/"+listName);
      }
    });
  }
});


app.get("/:customList", function(req, res) {
  const customList = _.capitalize(req.params.customList);

  List.findOne({name: customList}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customList,
          tasks: defaultTasks
        });

        list.save(function(err, result){
          res.redirect("/" + customList);
        });
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.tasks});
      }
    }
  });

});


app.get("/about", function(req, res) {
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
