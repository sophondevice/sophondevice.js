/** sophon base library */
import { YGFloatIsUndefined } from './yoga.js';

class YGFloatOptional {
    value_;
    isUndefined_;
    constructor(value = undefined) {
        if (value instanceof YGFloatOptional) {
            this.value_ = value.getValue();
            this.isUndefined_ = value.isUndefined();
            return;
        }
        if (YGFloatIsUndefined(value)) {
            this.value_ = 0;
            this.isUndefined_ = true;
        }
        else {
            this.value_ = value;
            this.isUndefined_ = false;
        }
    }
    clone() {
        return new YGFloatOptional(this.isUndefined_ ? undefined : this.value_);
    }
    getValue() {
        if (this.isUndefined_) {
            throw 'Tried to get value of an undefined YGFloatOptional';
        }
        return this.value_;
    }
    setValue(value) {
        this.value_ = value;
        this.isUndefined_ = false;
    }
    isUndefined() {
        return this.isUndefined_;
    }
    add(op) {
        if (!this.isUndefined_ && !op.isUndefined()) {
            return new YGFloatOptional(this.value_ + op.getValue());
        }
        return new YGFloatOptional();
    }
    isBigger(op) {
        if (this.isUndefined_ || op.isUndefined()) {
            return false;
        }
        return this.value_ > op.getValue();
    }
    isSmaller(op) {
        if (this.isUndefined_ || op.isUndefined()) {
            return false;
        }
        return this.value_ < op.getValue();
    }
    isBiggerEqual(op) {
        return this.isEqual(op) ? true : this.isBigger(op);
    }
    isSmallerEqual(op) {
        return this.isEqual(op) ? true : this.isSmaller(op);
    }
    isEqual(op) {
        if (this.isUndefined_ == op.isUndefined()) {
            return this.isUndefined_ ? true : this.value_ == op.getValue();
        }
        return false;
    }
    isDiff(op) {
        return !this.isEqual(op);
    }
    isEqualValue(val) {
        if (YGFloatIsUndefined(val) == this.isUndefined_) {
            return this.isUndefined_ || val == this.value_;
        }
        return false;
    }
    isDiffValue(val) {
        return !this.isEqualValue(val);
    }
}

export { YGFloatOptional };
//# sourceMappingURL=ygfloatoptional.js.map
