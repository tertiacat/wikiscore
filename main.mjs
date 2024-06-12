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
    rvprop: "timestamp|user|comment|content|ids",
    rvslots: "main",
    formatversion: 2,
    format: "json",
    rvlimit: 3
};

url = url + "?origin=*";
for (const key in params)
    url += "&" + key + "=" + params[key];

let data = await fetch(url)
    .then(res => res.json());

let pages = data.query.pages;

for (let p in pages) {
    for (let rev of pages[p].revisions) {
        console.log(rev.slots.main.content);
    }
}

export {}
