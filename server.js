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
mongoose.connect("mongodb://localhost/yogascrape", { useNewUrlParser: true });

// // Use mongojs to hook the database to the db variable
// var db = mongojs(databaseUrl, collections);

// // This makes sure that any errors are logged if mongodb runs into an issue
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

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
    res.render("index")
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

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {

// db.Article
// .findOne({ _id: req.params.id })
// .populate("note")
// .then(function(dbArticle) {
//   res.json(dbArticle);
// })
// .catch(function(err) {
//   res.json(err);
// });
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {

// db.Note
// .create(req.body)
// .then(function(dbNote) {
//   return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
// })
// .then(function(dbArticle) {
//   res.json(dbArticle);
// })
// .catch(function(err) {
//   res.json(err);
// });
// });

// // Route for saving/updating article to be saved
// app.put("/saved/:id", function(req, res) {

//   db.Article
//   .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true }})
//   .then(function(dbArticle) {
//     res.json(dbArticle);
//   })
//   .catch(function(err) {
//     res.json(err);
//   });
// });

// // Route for getting saved article
// app.get("/saved", function(req, res) {

//   db.Article
//   .find({ isSaved: true })
//   .then(function(dbArticle) {
//     res.json(dbArticle);
//   })
//   .catch(function(err) {
//     res.json(err);
//   });
// });

// // Route for deleting/updating saved article
// app.put("/delete/:id", function(req, res) {

//   db.Article
//   .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false }})
//   .then(function(dbArticle) {
//     res.json(dbArticle);
//   })
//   .catch(function(err) {
//     res.json(err);
//   });
// });

//get route to update 'saved' boolean to true
app.get('/saved/:id', (req,res) => {
  db.Article
    .update({_id: req.params.id},{saved: true})
    .then(result=> res.redirect('/'))
    .catch(err => res.json(err));
});

//get route to render savedArticles.handlebars and populate with saved articles
app.get('/saved', (req, res) => {
  db.Article
    .find({})
    .then(result => res.render('saved', {articles:result}))
    .catch(err => res.json(err));
});

//delete route to remove an article from savedArticles
app.delete('/deleteArticle/:id', function(req,res){
  db.Article
    .remove({_id: req.params.id})
    .then(result => res.json(result))
    .catch(err => res.json(err));
});

app.get('/saved', (req, res) => {
  db.Article
    .find({saved: true})
    .populate('notes')
    .then(articles => {
      res.render('saved', {articles});
    })
    .catch(err => console.log(err));
});

app.put('/saved', (req, res) => {

  let id = req.body.id;
  let isSaved = req.body.saved;
  db.Article.updateOne(
    { _id: id },
    { saved: isSaved },
    (err, doc) => {
      if (err) {
        console.log(err)
      } else {
        console.log(doc);
      }
    }
   )
   .then(() => {
     res.send(true);
   });
 
});

app.delete('/saved', (req, res) => {

  let id = req.body.id;
  db.Article.deleteOne({
    _id: id 
  }, (err) => {
    res.send(true);
    if (err) throw err
  });

});

// Listen on port 3000
app.listen(PORT, function() {
    console.log("App running on port" + PORT + " :)");
});