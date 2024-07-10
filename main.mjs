/*
    get_pages_revisions.js

    MediaWiki API Demos
    Demo of `Revisions` module: Get revision data with content for pages with titles [[API]] and [[Main Page]]

    MIT License
*/

function query(params) {
    var url = "https://en.wikipedia.org/w/api.php";

    url = url + "?origin=*";
    for (const key in params)
        url += "&" + key + "=" + params[key];

    return fetch(url).then(res => res.json());
}

const title = "Cultural_literacy";

let data = await (async () => {
    let out = [];
    let id = -1;
    while (true) {
        const querySize = 500;

        let params = {
            action: "query",
            prop: "revisions",
            titles: title,
            //titles: "Enteromius_teugelsi",
            rvprop: "timestamp|user|comment|ids",
            rvslots: "main",
            formatversion: 2,
            format: "json",
            rvlimit: querySize,
        };

        if (id != -1) params.rvstartid = id;

        let data = await query(params).then(obj => obj.query.pages[0].revisions);
         
        for (let d of data)
            out.push(d);

        if (data.length != querySize) break;

        id = data[querySize - 1].revid;
    }

    return out;
})();

function parse(id) {
    return query(
        {
            action: "parse",
            format: "json",
            oldid: id,
        }
    );
}

let html = [];
for (let rev of data)
    html.push(parse(rev.revid));

let pages = await Promise.all(html);

for (let rev of pages) {
    console.log("=====================");
    console.log("'\x1b[33m%s\x1b[0m'", pages[0].parse.text['*']);
    console.log("=====================");
}

export {}
