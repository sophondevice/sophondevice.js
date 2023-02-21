/** sophon base library */
class YGValue {
    value;
    unit;
    constructor(value, unit) {
        this.value = value;
        this.unit = unit;
    }
    clone() {
        return new YGValue(this.value, this.unit);
    }
}

export { YGValue };
//# sourceMappingURL=ygvalue.js.map
