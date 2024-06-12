/*
    get_pages_revisions.js

    MediaWiki API Demos
    Demo of `Revisions` module: Get revision data with content for pages with titles [[API]] and [[Main Page]]

    MIT License
*/

var url = "https://en.wikipedia.org/w/api.php";

var params = {
    action: "query",
    prop: "revisions",
    titles: "MIT_License",
    rvprop: "timestamp|user|comment|content",
    rvslots: "main",
    formatversion: "2",
    format: "json"
};

url = url + "?origin=*";
Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

fetch(url)
    .then(function(response){return response.json();})
    .then(function(response) {
        var pages = response.query.pages;
        for (var p in pages) {
            console.log(pages[p].revisions);
        }
    })
    .catch(function(error){console.log(error);});
