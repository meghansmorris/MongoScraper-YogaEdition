function displayArticles(data) {
    $("#articleList").empty();
    data.forEach(function(scrapedArticles) {
        var articleContainer = $("#articleList");
        articleContainer.addClass("card");

        var image = $(`<img src=${scrapedArticles.image} class="card-img-top">`);
        var cardBody = $(`<div data-id=${scrapedArticles._id} class="card-body">`);
        var cardTitle = $(`<h5 class="card-title">${scrapedArticles.title}</h5>`);
        var cardAuthor = $(`<p class="card-text">${scrapedArticles.author}</p>`);
        var cardLink = $(`<p class="card-text">${scrapedArticles.link}</p>`);

        articleContainer.append(image);
        articleContainer.append(cardBody);
        articleContainer.append(cardTitle);
        articleContainer.append(cardAuthor);
        articleContainer.append(cardLink);

    })
};

$.getJSON("/scrape", function(data) {
    displayArticles(data);
    console.log(data);
});

$("#scrapebtn").on("click", function() {
    $.getJSON("/scrape", function(data) {
        displayArticles(data);
    })
});

