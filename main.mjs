function query(params) {
    var url = "https://en.wikipedia.org/w/api.php";

    url = url + "?origin=*";
    for (const key in params)
        url += "&" + key + "=" + params[key];

    console.log(url);

    return fetch(url).then(res => res.json());
}

const title = "Cultural_literacy";
//const title = "Enteromius_teugelsi";

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

function existence(age, start, target) {
    let map = {};
    for (let i = 0; i < start.length; i++) {
        map[start[i]] = age[i] + 1;
    }

    let out = [];
    for (let i = 0; i < target.length; i++) {
        out[i] = map[target[i]] ?? 0;
    }

    return out;
}

function movesQuadratic(age, start, target) {
    let out = new Array(target.length).fill(0);
    let len = new Array(target.length).fill(0);

    for (let i = 0; i < start.length; ) {
        let maxl = 1;
        let targetStart = -1;
        for (let j = 0; j < target.length; j++) {
            let l = 0;
            while (i + l < start.length && j + l < target.length
                   && start[i + l] == target[j + l]) l++;

            if (l > maxl) {
                maxl = l;
                targetStart = j;
            }
        }

        if (targetStart != -1) {
            for (let j = 0; j < maxl; j++) {
                if (len[targetStart + j] < maxl) {
                    len[targetStart + j] = maxl;
                    out[targetStart + j] = age[i + j] + 1;
                }
            }
        }

        i += maxl;
    }

    return out;
}

let computeDiff = movesQuadratic;

let age = new Array(xml[0].length).fill(0);
for (let i = 1; i < xml.length; i++) {
    age = computeDiff(age, xml[i - 1], xml[i]);
}

console.log(age);

export {}
