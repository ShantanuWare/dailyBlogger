const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
require("dotenv").config();
const mongoAtlas = process.env.MONGO_ATLAS;

const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect(mongoAtlas, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database."))
  .catch((err) => console.error(err));

//  Task MAnager
const taskSchema = {
  name: String,
};

const Task = mongoose.model("Task", taskSchema);

// Check if there are any existing tasks in the database
Task.countDocuments({}, function (err, count) {
  if (err) {
    console.log(err);
  } else {
    // If there are no tasks in the database, insert the default tasks
    if (count === 0) {
      const task1 = new Task({
        name: "Welcome to DailyBlogger",
      });

      const task2 = new Task({
        name: "Click on compose to write daily Blog",
      });

      const task3 = new Task({
        name: "Click on + to add task and checkbox to delete task",
      });

      const defaultTasks = [task1, task2, task3];

      Task.insertMany(defaultTasks, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added default tasks to DB.");
        }
      });
    }
  }
});

const postSchema = {
  title: String,
  content: String,
};

const Post = mongoose.model("Post", postSchema);

app.get("/", async function (req, res) {
  try {
    const [task, post] = await Promise.all([Task.find({}), Post.find({})]);
    res.render("home", { task: task, post: post });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/delete", async (req, res) => {
  try {
    const checkedTaskId = req.body.checkbox;
    const postId = req.body.postId;

    if (checkedTaskId) {
      await Task.findByIdAndRemove(checkedTaskId);
      console.log("Successfully deleted checked task.");
      res.redirect("/");
    } else if (postId) {
      await Post.findByIdAndRemove(postId);
      console.log("Successfully deleted post.");
      res.redirect("/");
    } else {
      console.log("Invalid delete request");
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/", function (req, res) {
  const newTaskName = req.body.newTask;
  Task.findOneAndUpdate(
    { name: newTaskName },
    { name: newTaskName },
    { upsert: true },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully added/updated task.");
      }
      res.redirect("/");
    }
  );
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", async function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });

  try {
    await post.save();
    console.log("Post saved to database");
    res.redirect("/");
    console.log("Redirecting to home page");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,
    });
  });
});

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server started..!");
});
