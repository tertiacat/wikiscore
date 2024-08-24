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

function movesLinear(age, start, target) {
    let out = new Array(target.length).fill(0);
    let len = new Array(target.length).fill(0);

    let suffix = suffixArray(target);

    for (let i = 0; i < start.length; ) {
        let targetStart = -1;

        let exist = (k) => {
            let ok = 0;
            let ng = target.length;

            while (ng - ok > 1) {
                let mid = Math.floor((ng + ok) / 2);

                let leq = true;
                for (let j = 0; j < k && j < target.length - suffix[mid]; j++) {
                    if (target[suffix[mid] + j] < start[i + j]) break;

                    if (target[suffix[mid] + j] > start[i + j]) {
                        leq = false;
                        break;
                    }
                }

                if (leq) ok = mid;
                else ng = mid;
            }

            if (k > target.length - suffix[ok]) return false;

            for (let j = 0; j < k; j++) {
                if (target[suffix[ok] + j] != start[i + j]) return false;
            }

            targetStart = suffix[ok];

            return true;
        };

        let ok = 0;
        let ng = Math.min(target.length, start.length - i) + 1;

        while (ng - ok > 1) {
            let mid = Math.floor((ng + ok) / 2);
            if (exist(mid)) ok = mid;
            else ng = mid;
        }

        let maxl = ok;

        if (targetStart != -1) {
            for (let j = 0; j < maxl; j++) {
                if (len[targetStart + j] < maxl) {
                    len[targetStart + j] = maxl;
                    out[targetStart + j] = age[i + j] + 1;
                }
            }
        }

        i += Math.max(maxl, 1);
    }

    return out;
}

export { movesLinear };

