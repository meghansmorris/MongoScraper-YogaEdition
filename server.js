//To add:
//let the user know how many new articles were scraped after scrape button is clicked
//favorite articles only show on favorite page
//on favorite page -- allow the user to remove the article and add a note
//create a note column on the favorites page to hold the notes once entered
//clear articles function to clear out the current articles -- but still keep the saved

// Dependencies
var express = require("express");
//var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");
var mongoose = require("mongoose");

var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Set up a static folder (public) for our web app
app.use(express.static("public"));
// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
// Save the URL of our database as well as the name of our collection
// var databaseUrl = "yogascrape";
// var collections = ["scrapedArticles"];

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/yogascrape';
mongoose.connect(MONGODB_URI);
// mongoose.connect("mongodb://localhost/yogascrape", { useNewUrlParser: true });

//route to get all data from the collection as a json
app.get("/all", function(req,res) {
    db.Article.find({}, function(err, data) {
      if (err) {
        console.log(err);
  
      } else {
        res.json(data);
      }
    })
});

//route to scrape the data from the yoga journal site
app.get("/scrape", function(req, res) { 
    axios.get("https://www.yogajournal.com/").then(function(response) {
    // Load the HTML into cheerio and save it to a variable
      var $ = cheerio.load(response.data);
      // With cheerio, find each p-tag with the "title" class
      // (i: iterator or index. element: the current element) -- always include the index first
      $("div.m-standard-hero--container").each(function(index, element) {
        
        var result = {};

        result.title = $(this)
          .find("article")
          .find("a")
          .attr("title");
        result.link = $(this)
          .find("phoenix-super-link")
          .attr("href");
        result.image = $(this)
          .find("picture")
          .find("img")
          .attr("src");
        result.author = $(this)
          .find("ul")
          .find("a")
          .text();
  
        db.Article.create(result)
          .then(function(dbscrapedArticle) {
            console.log(dbscrapedArticle);
          })
          .catch(function(err) {
            console.log(err);
          })
      });
      res.send("New yoga articles scraped!");
    });
});

//html route for handlebars index page
app.get("/", function(req, res) {   
  db.Article.find({ saved: false }) 
    .then(function (dbArticles) {
      res.render("index", {articles: dbArticles})
    })
 });

//get all the articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbscrapedArticle) {
      res.json(dbscrapedArticle);
    })
    .catch(function(err) {
      res.json(err);
    })
});

//html route for handlebars saved page
app.get("/saved", function(req, res) {
  db.Article.find({saved: true})
    .then(function(dbArticles) {
      res.render("saved", { articles: dbArticles})
    })
});

// Route for saving/updating article to be saved
app.put("/saved/:id", function(req, res) {

  db.Article.update({
    saved: true
  },
  {
    where: {
      id: req.params.id
    }
  }).then(function(dbArticles) {
    res.json("saved", {articles: dbArticles});
  })
});

// Listen on port 3000
app.listen(PORT, function() {
    console.log("App running on port" + PORT + " :)");
});