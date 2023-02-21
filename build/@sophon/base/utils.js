/** sophon base library */
function zip(keys, values) {
    const ret = {};
    const len = keys.length;
    for (let i = 0; i < len; i++) {
        ret[keys[i]] = values[i];
    }
    return ret;
}

export { zip };
//# sourceMappingURL=utils.js.map
