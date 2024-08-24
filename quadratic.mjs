function movesQuadratic(age, start, target) {
    let out = new Array(target.length).fill(0);
    let len = new Array(target.length).fill(0);

    for (let i = 0; i < start.length; ) {
        let maxl = 0;
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

        i += Math.max(maxl, 1);
    }

    return out;
}

function movesQuadraticOnline(age, start, target) {
    let out = new Array(target.length).fill(0);
    let upd = new Array(target.length).fill(false);

    for (let i = 0; i < start.length; ) {
        let maxl = 0;
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
                if (!upd[targetStart + j]) {
                    upd[targetStart + j] = true;
                    age[i + j]++;
                }
            }
        }

        i += Math.max(maxl, 1);
    }
}

export { movesQuadratic, movesQuadraticOnline };
