import { movesQuadratic, movesQuadraticOnline } from "./quadratic.mjs";
//import { movesLinear, movesLinearOnline } from "./linear.mjs";

function query(params) {
    var url = "https://en.wikipedia.org/w/api.php";

    url = url + "?origin=*";
    for (const key in params)
        url += "&" + key + "=" + params[key];

    console.log(url);

    return fetch(url).then(res => res.json());
}

//const title = "United_States";
//const title = "William_Shakespeare";
const title = "Cultural_literacy";
//const title = "Enteromius_teugelsi";

async function computeAge(title) {
    let out = [];
    let id = -1;

    let params = {
        action: "query",
        prop: "revisions",
        titles: title,
        rvprop: "timestamp|user|comment|ids|content",
        rvslots: "main",
        formatversion: 2,
        format: "json",
        rvlimit: 50,
    };

    let target = -1;
    let age = [];

    let promise = query(params);

    while (true) {

        if (id != -1) params.rvstartid = id;

        let data = await promise;

        if (!data.batchcomplete) {
            params.rvcontinue = data.continue.rvcontinue;
            promise = query(params);
        }

        let start = new Date();
         
        for (let rev of data.query.pages[0].revisions) {
            let xml = rev.slots.main.content.split(/\s+/);

            if (target === -1) {
                target = xml;
                age = new Array(target.length).fill(0);
            } else {
                movesQuadraticOnline(age, xml, target);
            }
        }

        let end = new Date();

        console.log(end - start);

        if (data.batchcomplete) break;
    }

    return age;
}

let age = await computeAge(title);
console.log(age);

//let data = await (async () => {
//    let out = [];
//    let id = -1;
//
//    let params = {
//        action: "query",
//        prop: "revisions",
//        titles: title,
//        rvprop: "timestamp|user|comment|ids|content",
//        rvslots: "main",
//        formatversion: 2,
//        format: "json",
//        rvlimit: 50,
//    };
//
//    while (true) {
//
//        if (id != -1) params.rvstartid = id;
//
//        let data = await query(params);
//         
//        for (let d of data.query.pages[0].revisions)
//            out.push(d);
//
//        if (data.batchcomplete) break;
//
//        params.rvcontinue = data.continue.rvcontinue;
//    }
//
//    out.reverse();
//
//    return out;
//})();
//
//let xml = [];
//
//for (let rev of data)
//    xml.push(rev.slots.main.content.split(/\s+/));
//
//let computeDiff = movesQuadratic;
//
//{
//let age = new Array(xml[0].length).fill(0);
//for (let i = 1; i < xml.length; i++) {
//    age = computeDiff(age, xml[i - 1], xml[i]);
//}
//
//console.log(age);
//}

export {}
