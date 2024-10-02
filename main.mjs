import { movesQuadratic } from "./quadratic.mjs";
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
//const title = "E._D._Hirsch";
//const title = "Enteromius_teugelsi";

function processXML(xml) {
    let angle = 0;
    let braces = 0;

    xml = xml.split(/==\s*References\s*==/)[0];

    let result = '';

    for (let i = 0; i < xml.length; i++) {
        // NOTE: This is random hack to do things
        if (xml[i] === "<") angle++;
        if (xml[i] === "{") braces++;

        if (angle === 0 && braces === 0 && xml[i] !== '=' && xml[i] !== '*') result += xml[i];

        if (xml[i] === ">") angle--;
        if (xml[i] === "}") braces--;
    }

    return result;
}

async function computeAgeOnline(title) {
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
    let redir = [];

    let promise = query(params);

    while (true) {
        if (id != -1) params.rvstartid = id;

        let data = await promise;

        if (!data.batchcomplete) {
            params.rvcontinue = data.continue.rvcontinue;
            promise = query(params);
        }

        let start = new Date();
         
        for (let i = 0; i < data.query.pages[0].revisions.length; i++) {
            let rev = data.query.pages[0].revisions[i];
            let content = processXML(rev.slots.main.content);
            let xml = content.trim().split(/\s+/);

            if (target === -1) {
                target = xml;
                age = new Array(target.length).fill(0);
            } else {
                // TODO: do more sophisticated online algo
                movesQuadraticOnline(age, xml, target);
            }
        }

        let end = new Date();

        console.log(end - start);

        if (data.batchcomplete) break;
    }

    return age;
}

async function computeAgeOffline(title) {
    let data = await (async () => {
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

        while (true) {

            if (id != -1) params.rvstartid = id;

            let data = await query(params);
             
            for (let d of data.query.pages[0].revisions)
                out.push(d);

            if (data.batchcomplete) break;

            params.rvcontinue = data.continue.rvcontinue;
        }

        out.reverse();

        return out;
    })();

    let xml = [];

    for (let rev of data)
        xml.push(processXML(rev.slots.main.content).trim().split(/\s+/));

    let age = new Array(xml[0].length).fill(0);
    for (let i = 1; i < xml.length; i++) {
        let redir = movesQuadratic(xml[i - 1], xml[i]);
        let upd = new Array(xml[i].length).fill(0);

        for (let j = 0; j < redir.length; j++)
            if (redir[j] != -1)
                upd[redir[j]] = age[j] + 1;

        age = upd;
    }

    return age;
}

let age = await computeAgeOffline(title);
//let age2 = await computeAgeOnline(title);

const prob = 0.99;

for (let i = 0; i < age.length; i++)
    age[i] = (1 - Math.pow(prob, age[i]));

let mx = -1;
for (let i = 0; i < age.length; i++) mx = Math.max(mx, age[i]);
for (let i = 0; i < age.length; i++) age[i] = Math.floor(age[i] / mx * 256);

console.log(JSON.stringify(age));
console.log(age.length);

export {}
