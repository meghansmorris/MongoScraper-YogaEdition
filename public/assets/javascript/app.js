$(document).ready(function() {
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
                
                var card = $(`<div class="card"></div>`)
                var image = $(`<img src=${data.image} class="card-img-top">`);
                var cardBody = $(`<div data-id=${data._id} class="card-body">`);
                var cardTitle = $(`<h5 class="card-title">${data.title}</h5>`);
                var cardAuthor = $(`<p class="card-text">${data.author}</p>`);
                var cardLink = $(`<a class="btn btn-large btn-secondary articleLink" href="https://www.yogajournal.com${data.link}">
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
    var id = $(this).data('id');  
    $.ajax({
        url: '/saved',
        type: 'put',
        data: { _id: id, saved: true },
        success: function(res) {
        if (res) {
            console.log('article saved');
            alert('Article Favorited');
        }
        },
        error: function(err) {
        console.log(err);
        }
    });
    });

    
});

//clear deletes database -- clearing the articles