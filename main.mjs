import { existence } from "./existence.mjs";
import { movesQuadratic } from "./quadratic.mjs";
import { movesLinear } from "./linear.mjs";

function query(params) {
    var url = "https://en.wikipedia.org/w/api.php";

    url = url + "?origin=*";
    for (const key in params)
        url += "&" + key + "=" + params[key];

    console.log(url);

    return fetch(url).then(res => res.json());
}

//const title = "Cultural_literacy";
const title = "Enteromius_teugelsi";

let data = await (async () => {
    let out = [];
    let id = -1;
    while (true) {
        const querySize = 500;

        let params = {
            action: "query",
            prop: "revisions",
            titles: title,
            rvprop: "timestamp|user|comment|ids|content",
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

    out.reverse();

    return out;
})();

let xml = [];

for (let rev of data)
    xml.push(rev.slots.main.content.split(/\s+/));

let computeDiff = movesQuadratic;

let age = new Array(xml[0].length).fill(0);
for (let i = 1; i < xml.length; i++) {
    age = computeDiff(age, xml[i - 1], xml[i]);

    //console.log("\n");
    //for (let j = 0; j < xml[i].length; j++)
    //    console.log(age[j], xml[i][j]);
}

export {}
