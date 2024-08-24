// use suffix arrays to find substring
// implementation 
// courtesy of https://cp-algorithms.com/string/suffix-array.html

function sortCyclicShifts(str) {
    let n = str.length;

    let ord = {};

    {
        let alphabet = [];
        for (let i = 0; i < n; i++) alphabet.push(str[i]);
        alphabet.sort();
        for (let i = 0; i < n; i++) ord[alphabet[i]] = i;
    }

    let p = [], c = [], cnt = new Array(n).fill(0);

    for (let i = 0; i < n; i++)
        cnt[ord[str[i]]]++;
    for (let i = 1; i < n; i++)
        cnt[i] += cnt[i - 1];
    for (let i = 0; i < n; i++)
        p[--cnt[ord[str[i]]]] = i;
    c[p[0]] = 0;
    let classes = 1;
    for (let i = 1; i < n; i++) {
        if (str[p[i]] != str[p[i - 1]]) classes++;
        c[p[i]] = classes - 1;
    }

    let pn = [], cn = [];
    for (let h = 0; (1 << h) < n; h++) {
        for (let i = 0; i < n; i++) {
            pn[i] = p[i] - (1 << h);
            if (pn[i] < 0)
                pn[i] += n;
        }
        cnt.fill(0);

        for (let i = 0; i < n; i++)
            cnt[c[pn[i]]]++;
        for (let i = 1; i < classes; i++)
            cnt[i] += cnt[i - 1];
        for (let i = n - 1; i >= 0; i--)
            p[--cnt[c[pn[i]]]] = pn[i];

        cn[p[0]] = 0;
        classes = 1;
        for (let i = 1; i < n; i++) {
            if (c[p[i]] != c[p[i - 1]]
                || c[(p[i] + (1 << h)) % n] != c[(p[i - 1] + (1 << h)) % n])
                classes++;

            cn[p[i]] = classes - 1;
        }

        c = cn;
    }

    return p;
}

function suffixArray(str) {
    str.push("\0");
    let p = sortCyclicShifts(str);
    p.shift();
    return p;
}

function movesLinear() {
}

export { movesLinear };

