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

export { existence };
