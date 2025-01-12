import { movesQuadratic } from "./quadratic.mjs";
//import { movesLinear, movesLinearOnline } from "./linear.mjs";

function query(params) {
    var url = "https://en.wikipedia.org/w/api.php";

    url = url + "?origin=*";
    for (const key in params)
        url += "&" + key + "=" + params[key];

    console.log(url);

    return fetch(url)
        .catch(err => console.error(err))
        .then(res => res.json());
}

const TEST = false;

function processXML(xml) {
    let angle = 0;
    let braces = 0;

    // NOTE: Don't mind the ugly hacks
    xml = xml.split(/==\s*References\s*==/)[0];
    xml = xml.replace(/\{\{.+?\}\}/gs, "");
    xml = xml.replace(/<.+?>/gs, "");
    xml = xml.replace(/\[\[[^\[\]]+?\|(.+?)\]\]/gs, "[[$1]]");

    return xml;
}

function ageToProb(age) {
    const r = 0.95;
    const c = 0.3;

    let prob = []

    for (let i = 0; i < age.length; i++)
        prob[i] = c / ((1 - c) * Math.pow(r, age[i]) + c);

    return prob;
}

let average = [];
let max = [];
let count = 0;

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

    let prev = -1;
    let age = [];
    let redir = [];

    let promise = query(params);

    let start = new Date();

    let probs = [];
    let times = [];

    while (true) {
        if (id != -1) params.rvstartid = id;

        let data = await promise;

        if (!data.batchcomplete) {
            params.rvcontinue = data.continue.rvcontinue;
            promise = query(params);
        }
         
        for (let i = 0; i < data.query.pages[0].revisions.length; i++) {
            let rev = data.query.pages[0].revisions[i];

            if (rev.slots.main.texthidden) continue;

            let content = processXML(rev.slots.main.content);
            let xml = content.trim().split(/\s+/);

            if (prev === -1) {
                age = new Array(xml.length).fill(-1);
                redir = new Array(xml.length).fill(0);
                for (let j = 0; j < redir.length; j++) redir[j] = j;

                prev = xml;
            } else {
                let rd = movesQuadratic(xml, prev);
                prev = xml;

                for (let j = 0; j < rd.length; j++) rd[j] = redir[rd[j]];
                redir = rd;
            }

            for (let j = 0; j < redir.length; j++)
                age[redir[j]]++;

            if (TEST) {
                let prob = ageToProb(age);
                probs.push(prob);
            }
        }

        let end = new Date();

        if (data.batchcomplete) break;
    }

    if (TEST) {
        let avgi = -1;
        let maxi = -1;

        for (let i = 0; i < probs.length; i++) {
            let sum = 0;
            let mx = 0;
            for (let j = 0; j < probs[i].length; j++) {
                let er = Math.abs(probs[i][j] - probs[probs.length - 1][j]);
                sum += er;
                mx = Math.max(mx, er);
            }

            let avg = sum / probs[i].ength;

            if (mx <= 0.05 && maxi == -1) maxi = i;
            if (sum / probs[i].length <= 0.05 && avgi == -1) avgi = i;
        }

        average.push(avgi);
        max.push(maxi);
        count++;
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

    for (let rev of data) {
        if (rev.slots.main.texthidden) continue;
        xml.push(processXML(rev.slots.main.content).trim().split(/\s+/));
    }

    let age = new Array(xml[0].length).fill(0);
    for (let i = 1; i < xml.length; i++) {
        let redir = movesQuadratic(xml[i - 1], xml[i]);
        let upd = new Array(xml[i].length).fill(0);

        for (let j = 0; j < redir.length; j++)
            if (redir[j] != -1)
                upd[redir[j]] = age[j] + 1;

        age = upd;

        let prob = ageToProb(age);
        for (let i = 0; i < prob.length; i++) prob[i] = Math.floor(prob[i] * 256);
        console.log(JSON.stringify(xml[i]));
        console.log(JSON.stringify(prob));
    }

    return age;
}

if (TEST) {
    let sample = 100 - count;
    let attempt = 10;

    let start = new Date();
    while (sample > 0) {
        let params = {
            format: "json",
            action: "query",
            generator: "random",
            grnnamespace: "0",
            grnlimit: attempt,
        };

        let titles = await query(params);

        for (let id in titles.query.pages) {
            let title = titles.query.pages[id].title;

            await computeAgeOnline(title);
        }

        sample -= attempt;

        console.log(JSON.stringify(average));
        console.log(JSON.stringify(max));
        console.log(count);
    }

    let end = new Date();

    console.log(average, max);
    console.log(end - start);
}

//const title = "United_States";
//const title = "William_Shakespeare";
const title = "Cultural_literacy";
//const title = "Herbert_(Family_Guy)";
//const title = "E._D._Hirsch";
//const title = "Enteromius_teugelsi";
//const title = "Enculturation";
//const title = "Nasookin";

let age = await computeAgeOnline(title);
let prob = ageToProb(age);

console.log(JSON.stringify(prob));

for (let i = 0; i < prob.length; i++) prob[i] = Math.floor(prob[i] * 256);

console.log(JSON.stringify(age));
console.log(JSON.stringify(prob));
console.log(prob.length);

export {}
