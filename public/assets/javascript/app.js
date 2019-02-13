
$.getJSON("/articles", function(data) {
    console.log(data);
    $("#articleList").empty();

    data.forEach(function(data) {        
        var articleContainer = $("#articleList");
        
        var card = $(`<div class="card"></div>`)
        var image = $(`<img src=${data.image} class="card-img-top">`);
        var cardBody = $(`<div data-id=${data._id} class="card-body">`);
        var cardTitle = $(`<h5 class="card-title">${data.title}</h5>`);
        var cardAuthor = $(`<p class="card-text">${data.author}</p>`);
        var cardLink = $(`<p class="card-text">${data.link}</p>`);

        articleContainer.append(card);
        card.append(image);
        card.append(cardBody);
        card.append(cardTitle);
        card.append(cardAuthor);
        card.append(cardLink);
    });

});

// $("#scrapebtn").on("click", function() {
//     $.getJSON("/scrape", function(data) {
//         displayArticles(data);
//     })
// });

