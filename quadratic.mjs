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

export { movesQuadratic };
