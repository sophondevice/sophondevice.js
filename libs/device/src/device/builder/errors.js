export function expValueToString(deviceType, value) {
    if (typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
        return `${value}`;
    }
    else {
        return value.$ast?.toString(deviceType);
    }
}
export function expValueTypeToString(deviceType, type) {
    return type?.toTypeName(deviceType);
}
export class PBError extends Error {
}
export class PBValueOutOfRange extends PBError {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    getMessage(deviceType) {
        return `value out of range: ${this.value}`;
    }
}
export class PBTypeCastError extends PBError {
    value;
    valueType;
    expectedType;
    constructor(value, valueType, expectedType) {
        super();
        this.value = value;
        this.valueType = valueType;
        this.expectedType = expectedType;
    }
    getMessage(deviceType) {
        const valueStr = typeof this.value === 'string' ? this.value : expValueToString(deviceType, this.value);
        const valueTypeStr = typeof this.valueType === 'string' ? this.valueType : expValueTypeToString(deviceType, this.valueType);
        const expectedTypeStr = typeof this.expectedType === 'string' ? this.expectedType : expValueTypeToString(deviceType, this.expectedType);
        return `cannot convert '${valueStr}' of type '${valueTypeStr}' to type ${expectedTypeStr}`;
    }
}
export class PBParamLengthError extends PBError {
    func;
    constructor(func) {
        super();
        this.func = func;
    }
    getMessage(deviceType) {
        return `wrong argument count for function '${this.func}'`;
    }
}
export class PBParamTypeError extends PBError {
    func;
    param;
    constructor(func, param) {
        super();
        this.func = func;
        this.param = param || null;
    }
    getMessage(deviceType) {
        return `parameter type error for function '${this.func}': ${this.param}`;
    }
}
export class PBParamValueError extends PBError {
    func;
    param;
    reason;
    constructor(func, param, reason) {
        super();
        this.func = func;
        this.param = param || null;
        this.reason = reason || null;
    }
    getMessage(deviceType) {
        return `invalid parameter value for function '${this.func}'${this.param ? ': ' + this.param : ''}${this.reason ? ': ' + this.reason : ''}}`;
    }
}
export class PBOverloadingMatchError extends PBError {
    func;
    constructor(func) {
        super();
        this.func = func;
    }
    getMessage(deviceType) {
        return `No matched overloading found for function '${this.func}'`;
    }
}
export class PBReferenceValueRequired extends PBError {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    getMessage(deviceType) {
        return `'${expValueToString(deviceType, this.value)}' is not a reference type`;
    }
}
export class PBPointerValueRequired extends PBError {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    getMessage(deviceType) {
        return `'${expValueToString(deviceType, this.value)}' is not a pointer type`;
    }
}
export class PBUndeclaredIdentifier extends PBError {
    constructor(identifier) {
        super(`undeclared identifier: ${identifier}`);
    }
    getMessage(deviceType) {
        return this.message;
    }
}
export class PBDeviceNotSupport extends PBError {
    feature;
    constructor(feature) {
        super();
        this.feature = feature;
    }
    getMessage(deviceType) {
        return `feature not support for ${deviceType} device: ${this.feature}`;
    }
}
export class PBNonScopedFunctionCall extends PBError {
    funcName;
    constructor(funcName) {
        super();
        this.funcName = funcName;
    }
    getMessage(deviceType) {
        return `function call must be made inside a function scope: ${this.funcName}()`;
    }
}
export class PBASTError extends PBError {
    ast;
    text;
    constructor(ast, text) {
        super();
        this.ast = ast;
        this.text = text;
    }
    getMessage(deviceType) {
        return `${this.text}: ${this.ast.toString(deviceType)}`;
    }
}
export class PBInternalError extends PBError {
    constructor(desc) {
        super(desc);
    }
    getMessage(deviceType) {
        return `Internal error: ${this.message}`;
    }
}
//# sourceMappingURL=errors.js.map