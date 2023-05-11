const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
require('dotenv').config()
const mongoAtlas=process.env.mongoAtlas;

const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(mongoAtlas, {
  useNewUrlParser: true,
});

//  Task MAnager
const taskSchema =new mongoose.Schema( {
  name: String,
});

const Task = mongoose.model("Task", taskSchema);

const task1 = new Task({
  name: "Welcome to DailyBlogger",
});

const task2 = new Task({
  name: "Click on compose to write daily Blog",
});

const task3 = new Task({
  name: "Click on + to add task and checkbox to delete task",
});

const defaultTask = [task1, task2, task3];

Task.insertMany(defaultTask, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully Addedd defaultTask to DB.");
  }
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
  Promise.all([Task.find({}), Post.find({})]).then(function (result) {
    const [task, post] = result;
    res.render("home", { task: task, post: post });
  });
});

app.post("/delete", function (req, res) {
  const checkedTaskId = req.body.checkbox;
  const postId = req.body.postId;

  if (checkedTaskId) {
    Task.findByIdAndRemove(checkedTaskId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else if (postId) {
    Post.findByIdAndRemove(postId, function (err) {
      if (!err) {
        console.log("Successfully deleted post.");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {
    console.log("Invalid delete request");
    res.redirect("/");
  }
});

app.post("/", function (req, res) {
  const newTaskName = req.body.newTask;
  const task = new Task({
    name: newTaskName,
  });
  task.save();
  res.redirect("/");
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });
});



app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.listen(process.env.PORT ||3000, function () {
  console.log("server started..!");
}); 
