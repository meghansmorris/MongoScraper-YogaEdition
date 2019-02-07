// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Set up a static folder (public) for our web app
app.use(express.static("public"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
// Save the URL of our database as well as the name of our collection
var databaseUrl = "yogascrape";
var collections = ["scrapedArticles"];

// Use mongojs to hook the database to the db variable
var db = mongojs(databaseUrl, collections);

// This makes sure that any errors are logged if mongodb runs into an issue
db.on("error", function(error) {
  console.log("Database Error:", error);
});
//route to get all data from the collection as a json
app.get("/all", function(req,res) {
    db.scrapedArticles.find({}, function(err, data) {
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
      $("div.l-grid--item").each(function(index, element) {
  
        var title = $(element).find("a").attr("title");
        var link = $(element).find("a").attr("href");
        var image = $(element).find("img").attr("src");
  
        db.scrapedArticles.insert(
          {
            title: title,
            link: link,
            image: image
            }, function(err, inserted) {
              if (err) {
                console.log(err);
              } else {
                console.log(inserted);
              }
            })
      });
  
      res.send("Scrape action kicked off!");
    });
  
});

// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000 :)");
  });