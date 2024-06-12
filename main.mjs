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
    titles: "Enteromius_teugelsi",
    rvprop: "timestamp|user|comment|content|ids",
    rvslots: "main",
    formatversion: 2,
    format: "json",
    rvlimit: 1
};

url = url + "?origin=*";
for (const key in params)
    url += "&" + key + "=" + params[key];

let data = await fetch(url)
    .then(res => res.json());

let pages = data.query.pages;

for (let p in pages) {
    for (let rev of pages[p].revisions) {
        console.log("=====================");
        console.log("'\x1b[33m%s\x1b[0m'", rev.slots.main.content);
        console.log("=====================");
    }
}

export {}
