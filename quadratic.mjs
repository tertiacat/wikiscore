function movesQuadratic(start, target) {
    let len = new Array(target.length).fill(0);
    let inv = new Array(target.length).fill(-1);

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
                    inv[targetStart + j] = i + j;
                }
            }
        }

        i += Math.max(maxl, 1);
    }

    let redir = new Array(start.length).fill(-1);
    for (let i = 0; i < target.length; i++)
        if (inv[i] != -1) redir[inv[i]] = i;

    return redir;
}

export { movesQuadratic };
