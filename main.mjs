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

const TEST = false;

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

function ageToProb(age) {
    const r = 0.95;
    const c = 0.3;

    let prob = []

    for (let i = 0; i < age.length; i++)
        prob[i] = c / ((1 - c) * Math.pow(r, age[i]) + c);

    return prob;
}

let error = [];
let count = 90;

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
                const trial = 0.99;
                let prob = [];

                for (let i = 0; i < age.length; i++) 
                    prob[i] = (1 - Math.pow(trial, age[i]));

                probs.push(prob);
            }
        }

        let end = new Date();

        if (data.batchcomplete) break;
    }

    if (TEST) {
        let avgError = [];
        for (let i = 0; i < probs.length; i++) {
            let sum = 0;
            for (let j = 0; j < probs[i].length; j++) {
                sum += Math.abs(probs[i][j] - probs[probs.length - 1][j]);
            }
            avgError.push(sum / probs[i].length);
        }

        for (let i = 0; i < avgError.length; i++) {
            if (error[i] === undefined) error[i] = 0;
            error[i] += avgError[i];
        }
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

if (TEST) {
    let sample = 10;
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

        console.log(JSON.stringify(error));
        console.log(JSON.stringify(count));
    }

    let end = new Date();

    for (let i = 0; i < error.length; i++)
        error[i] /= count;

    console.log(JSON.stringify(error));
    console.log(end - start);
}


//const title = "United_States";
//const title = "William_Shakespeare";
//const title = "Cultural_literacy";
const title = "E._D._Hirsch";
//const title = "Enteromius_teugelsi";
//const title = "Enculturation";
//const title = "Nasookin";

let age = await computeAgeOnline(title);
let prob = ageToProb(age);

for (let i = 0; i < prob.length; i++) prob[i] = Math.floor(prob[i] * 256);

console.log(JSON.stringify(age));
console.log(JSON.stringify(prob));
console.log(prob.length);

export {}
