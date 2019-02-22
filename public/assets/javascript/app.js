$(document).ready(function() {
    var db = require("../../../models");


    var data;
    function renderArticles() {
        console.log("inside render articles")
        $.getJSON("/articles", function(data) {
            data = data;
            
            console.log("global data", data);
            $("#articleList").empty();
            //make this it's own function and give it data -- call from inside getJSON, pass it data

            data.forEach(function(data) {        
                var articleContainer = $("#articleList");
                
                var card = $(`<div data-id=${data._id} class="card"></div>`)
                var image = $(`<img src=${data.image} class="card-img-top">`);
                var cardBody = $(`<div data-id=${data._id} class="card-body">`);
                var cardTitle = $(`<h5 class="card-title">${data.title}</h5>`);
                var cardAuthor = $(`<p class="card-text">${data.author}</p>`);
                var cardLink = $(`<a class="btn btn-large btn-secondary articleLink" target="_blank" href="https://www.yogajournal.com${data.link}">
                                <i class="fas fa-link fa-clickable" aria-hidden="true"></i></a>`);
                var favoritebtn = $(`<a class="btn btn-large btn-danger favorite">
                                <i class="far fa-heart fa-clickable" aria-hidden="true"></i></a>`);
                        
                articleContainer.append(card);
                card.append(image);
                card.append(cardBody);
                card.append(cardTitle);
                card.append(cardAuthor);
                card.append(cardLink);
                card.append(favoritebtn);
            });
         // add functionality -- when you do the scrape, you call the getJSON function and articlelist - if same, no new, if not equal, math new articles
        });  
    }

    renderArticles();

    $(".scrapenew").on("click", function() {
        console.log("inside scrape button");
        $.get("/scrape", function(data) {
            console.log(data);

        }).then(function() {
            renderArticles()
        })
    });

    function initPage() {
        $.get("/articles?saved=false").then(function(data) {
            $("articleList").empty();

            if(data && data.length) {
                renderArticles(data);
            } else {
                alert("Scrape for new articles")
            }
        })
    }

    // $(document).on('click', '#clearbtn', function(e) {
    //     e.preventDefault();
    //     $.ajax({
    //       url: '/scrape',
    //       type: 'delete',
    //       success: function(res) {
    //         if (res){
    //           console.log('scraped articles cleared');
    //           $('.scraped-articles').empty();
    //         }
    //       },
    //       error: function(err) {
    //         console.log(err);
    //       }
    //     });
    //   });
    
    
    $(document).on('click', '.favorite', function(e) {
        e.preventDefault();

        var idToSave = $(this).parents(".card").find(".card-body").data();
        //var articleToSave = $(this).parents("").find(".card").data();

        console.log("inside favorite-id", $(this).parents(".card").find(".card-body").data());
        console.log("inside favorite-article", $(this).find("#articleList"));

        $(this).parents(".card").find(".card-body").remove();

        idToSave.saved = true;

        $.ajax({
            method: "PUT",
            url: '/articles/' + idToSave.id,
            data: articleToSave
        }).then(function(data) {
            if (data.saved) {
                initPage();
            }
        })
    });

    
});

//clear deletes database -- clearing the articles