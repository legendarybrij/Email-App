var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var incoming = require('./public/assets/articles/list.json');

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/email";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var d = new Date();

// Routes
app.get("/scrape", function(req, res) {
  db.Article.deleteMany({})
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

  
    var result = {};
    for(var i=0; i<incoming.length;i++)
     {
      result.from = incoming[i].from;
      result.title = incoming[i].title;
      result.message = incoming[i].message;
      result.saved = incoming[i].saved;
      result.delete = incoming[i].delete;
      result.time = incoming[i].time;
      // console.log(incoming[i].from, result.from);
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
      .then(function(dbArticle) {
        // View the added result in the console
      // console.log("db",dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
      
     }
     //console.log("result::",result);
   
     
        res.redirect('/#articlesHeading');
  
});
app.get("/remove", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.deleteMany({})
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
    res.redirect('/#'+"Removed+Successfully");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({delete: false, saved:false})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/sent", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all Saved Articles from the db
app.get("/savedarticles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({ saved: true })
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//saving articles from home page 
app.post("/save/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOneAndUpdate({ _id: req.params.id }, {saved: true},{ new: true })
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//delete articles from saved page 
app.post("/delete/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOneAndUpdate({ _id: req.params.id }, {saved: false},{ new: true })
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//delete articles from home page 
app.post("/deleteArticle/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOneAndUpdate({ _id: req.params.id }, {delete: true},{ new: true })
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.get("/saved", function (req, res) {
  res.sendfile("./public/saved.html");
});

app.get("/", function (req, res) {
  res.sendfile("./public/index.html");
});

app.get("/compose", function (req, res) {
  res.sendfile("./public/compose.html");
});

// Render 404 page for any unmatched routes
app.get("*", function (req, res) {
  res.sendfile("./public/404.html");
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
