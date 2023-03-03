import {
  getTextureSampleType,
  ShaderPrecisionType,
  ASTExpression,
  DeclareType,
  ASTPrimitive,
  ASTScalar,
  ASTArrayIndex,
  ASTLValueArray,
  ASTLValueHash,
  ASTLValueScalar,
  ASTHash,
  ASTShaderExpConstructor,
  ASTAssignment
} from './ast';
import {
  PBTypeInfo,
  PBPrimitiveType,
  PBPrimitiveTypeInfo,
  PBArrayTypeInfo,
  PBPointerTypeInfo,
  PBAddressSpace,
  typeI32
} from './types';
import { PBASTError } from './errors';
import type { VertexSemantic } from '../gpuobject';
import type { ProgramBuilder } from './programbuilder';

let currentProgramBuilder: ProgramBuilder = null;
const constructorCache: Map<ShaderTypeFunc, Record<string | symbol, ShaderTypeFunc>> = new Map();

/** @internal */
export function setCurrentProgramBuilder(pb: ProgramBuilder) {
  currentProgramBuilder = pb;
}

/** @internal */
export function getCurrentProgramBuilder(): ProgramBuilder {
  return currentProgramBuilder;
}

export interface ShaderExpTagRecord {
  [name: string]: ShaderExpTagValue;
}
export type ShaderExpTagValue = string[] | string | ShaderExpTagRecord;

export type ShaderTypeFunc = {
  (...args: any[]): PBShaderExp;
  ptr: ShaderTypeFunc;
  [dim: number]: ShaderTypeFunc;
};

/** @internal */
export function makeConstructor(typeFunc: ShaderTypeFunc, elementType: PBTypeInfo): ShaderTypeFunc {
  const wrappedTypeFunc = new Proxy(typeFunc, {
    get: function (target, prop) {
      if (typeof prop === 'symbol' || prop in target) {
        return target[prop];
      }
      let entries = constructorCache.get(typeFunc);
      if (!entries) {
        entries = {};
        constructorCache.set(typeFunc, entries);
      }
      let ctor = entries[prop];
      if (!ctor) {
        if (elementType.isPrimitiveType() || elementType.isStructType() || elementType.isArrayType()) {
          if (prop === 'ptr') {
            const pointerType = new PBPointerTypeInfo(elementType, PBAddressSpace.FUNCTION);
            ctor = function pointerCtor(this: ProgramBuilder, ...args: any[]) {
              if (args.length === 1 && typeof args[0] === 'string') {
                return new PBShaderExp(args[0], pointerType);
              } else {
                throw new Error(`Invalid pointer type constructor`);
              }
            } as ShaderTypeFunc;
          } else {
            const dim = Number(prop);
            if (Number.isInteger(dim) && dim >= 0) {
              const arrayType = new PBArrayTypeInfo(elementType, dim);
              const arrayTypeFunc = function arrayCtor(this: ProgramBuilder, ...args: any[]) {
                if (args.length === 1 && typeof args[0] === 'string') {
                  return new PBShaderExp(args[0], arrayType);
                } else {
                  const exp = new PBShaderExp('', arrayType);
                  exp.$ast = new ASTShaderExpConstructor(
                    exp.$typeinfo,
                    args.map((arg) => (arg instanceof PBShaderExp ? arg.$ast : arg))
                  );
                  return exp;
                }
              };
              ctor = makeConstructor(arrayTypeFunc as ShaderTypeFunc, arrayType);
            }
          }
        }
      }
      if (ctor) {
        entries[prop] = ctor;
      }
      return ctor;
    }
  });
  return wrappedTypeFunc;
}

export abstract class Proxiable<T> {
  /** @internal */
  private proxy: Proxiable<T>;
  constructor() {
    this.proxy = new Proxy(this, {
      get: function (target, prop) {
        return typeof prop === 'string' ? target.$get(prop) : undefined;
      },
      set: function (target, prop, value) {
        return typeof prop === 'string' ? target.$set(prop, value) : false;
      }
    }) as Proxiable<T>;
    return this.proxy;
  }
  get $thisProxy(): T {
    return this.proxy as unknown as T;
  }
  /** @internal */
  protected abstract $get(prop: string): any;
  /** @internal */
  protected abstract $set(prop: string, value: any): boolean;
}

let uidExp = 0;

export class PBShaderExp extends Proxiable<PBShaderExp> {
  /** @internal */
  $uid: number;
  /** @internal */
  $str: string;
  /** @internal */
  $location: number;
  /** @internal */
  $typeinfo: PBTypeInfo;
  /** @internal */
  $global: boolean;
  /** @internal */
  $sampleType: 'depth' | 'sint' | 'uint' | 'float' | 'unfilterable-float';
  /** @internal */
  $precision: ShaderPrecisionType;
  /** @internal */
  $ast: ASTExpression;
  /** @internal */
  $inout: string;
  /** @internal */
  $memberCache: { [name: string]: PBShaderExp };
  /** @internal */
  $attrib: VertexSemantic;
  /** @internal */
  $tags: ShaderExpTagValue[];
  /** @internal */
  $group: number;
  /** @internal */
  $declareType: DeclareType;
  [name: string]: any;
  /** @internal */
  constructor(str: string, typeInfo: PBTypeInfo) {
    super();
    if (!str && typeInfo.isPointerType()) {
      throw new Error('no default constructor for pointer type');
    }
    this.$uid = uidExp++;
    this.$str = str || '';
    this.$location = 0;
    this.$global = false;
    this.$typeinfo = typeInfo;
    this.$qualifier = null;
    this.$precision = ShaderPrecisionType.NONE;
    this.$ast = new ASTPrimitive(this);
    this.$inout = null;
    this.$memberCache = {};
    this.$attrib = null;
    this.$tags = [];
    this.$group = null;
    this.$declareType = DeclareType.DECLARE_TYPE_NONE;
    if (typeInfo.isTextureType()) {
      if (typeInfo.isDepthTexture()) {
        this.$sampleType = 'depth';
      } else {
        const t = getTextureSampleType(typeInfo);
        if (t.primitiveType === PBPrimitiveType.I32) {
          this.$sampleType = 'sint';
        } else if (t.primitiveType === PBPrimitiveType.U32) {
          this.$sampleType = 'uint';
        } else {
          this.$sampleType = 'float';
        }
      }
    }
  }
  uniform(group: number): PBShaderExp {
    this.$declareType = DeclareType.DECLARE_TYPE_UNIFORM;
    this.$group = group;
    return this;
  }
  workgroup(): PBShaderExp {
    this.$declareType = DeclareType.DECLARE_TYPE_WORKGROUP;
    return this;
  }
  storage(group: number): PBShaderExp {
    if (!this.$typeinfo.isHostSharable()) {
      throw new PBASTError(this.$ast, 'type cannot be declared in storage address space');
    }
    this.$declareType = DeclareType.DECLARE_TYPE_STORAGE;
    this.$group = group;
    return this;
  }
  attrib(attr: VertexSemantic): PBShaderExp {
    this.$declareType = DeclareType.DECLARE_TYPE_IN;
    this.$attrib = attr;
    return this;
  }
  tag(...args: ShaderExpTagValue[]): PBShaderExp {
    args.forEach((val) => {
      if (this.$tags.indexOf(val) < 0) {
        this.$tags.push(val);
      }
    });
    return this;
  }
  sampleType(type: 'float' | 'unfilterable-float' | 'sint' | 'uint' | 'depth'): PBShaderExp {
    if (type) {
      this.$sampleType = type;
    }
    return this;
  }
  at(index: number | PBShaderExp) {
    const varType = this.$ast.getType();
    if (!varType.isArrayType()) {
      throw new Error('at() function must be used with array types');
    }
    if (typeof index === 'number') {
      if (!Number.isInteger(index)) {
        throw new Error('at() array index must be integer type');
      }
      if (index < 0 || (varType.dimension > 0 && index >= varType.dimension)) {
        throw new Error('at() array index out of bounds');
      }
    }
    const result = new PBShaderExp('', varType.elementType);
    result.$ast = new ASTArrayIndex(
      this.$ast,
      typeof index === 'number' ? new ASTScalar(index, typeI32) : index.$ast,
      varType.elementType
    );
    return result;
  }
  setAt(index: number | PBShaderExp, val: number | boolean | PBShaderExp) {
    const varType = this.$ast.getType();
    if (!varType.isArrayType()) {
      throw new Error('setAt() function must be used with array types');
    }
    if (typeof index === 'number') {
      if (!Number.isInteger(index)) {
        throw new Error('setAt() array index must be integer type');
      }
      if (index < 0 || (varType.dimension > 0 && index >= varType.dimension)) {
        throw new Error('setAt() array index out of bounds');
      }
    }
    currentProgramBuilder
      .currentScope()
      .$ast.statements.push(
        new ASTAssignment(
          new ASTLValueArray(
            new ASTLValueScalar(this.$ast),
            typeof index === 'number' ? new ASTScalar(index, typeI32) : index.$ast,
            varType.elementType
          ),
          val instanceof PBShaderExp ? val.$ast : val
        )
      );
  }
  highp(): PBShaderExp {
    this.$precision = ShaderPrecisionType.HIGH;
    return this;
  }
  mediump(): PBShaderExp {
    this.$precision = ShaderPrecisionType.MEDIUM;
    return this;
  }
  lowp(): PBShaderExp {
    this.$precision = ShaderPrecisionType.LOW;
    return this;
  }
  isVector(): boolean {
    const varType = this.$ast.getType();
    return varType.isPrimitiveType() && varType.isVectorType();
  }
  numComponents(): number {
    const varType = this.$ast.getType();
    return varType.isPrimitiveType() ? varType.cols : 0;
  }
  getTypeName(): string {
    return this.$ast.getType().toTypeName(currentProgramBuilder.device.type);
  }
  /** @internal */
  protected $get(prop: string): any {
    if (typeof prop === 'string') {
      if (prop[0] === '$' || prop in this) {
        return this[prop];
      } else {
        let exp = this.$memberCache[prop];
        if (!exp) {
          const varType = this.$ast?.getType() || this.$typeinfo;
          const num = Number(prop);
          if (Number.isNaN(num)) {
            if (varType.isStructType()) {
              const elementIndex = varType.structMembers.findIndex((val) => val.name === prop);
              if (elementIndex < 0) {
                throw new Error(`unknown struct member '${prop}'`);
              }
              const element = varType.structMembers[elementIndex];
              if (element.type.isStructType()) {
                const ctor = currentProgramBuilder.structInfo.structs[element.type.structName];
                exp = ctor.call(currentProgramBuilder, `${this.$str}.${prop}`);
              } else {
                exp = new PBShaderExp(`${this.$str}.${prop}`, element.type);
              }
              exp.$ast = new ASTHash(this.$ast, prop, element.type);
            } else {
              if (!varType.isPrimitiveType() || !varType.isVectorType()) {
                throw new Error(
                  `invalid index operation: ${this.$ast.toString(
                    currentProgramBuilder.device.type
                  )}[${prop}]`
                );
              }
              if (
                prop.length === 0 ||
                prop.length > varType.cols ||
                ([...prop].some((val) => 'xyzw'.slice(0, varType.cols).indexOf(val) < 0) &&
                  [...prop].some((val) => 'rgba'.slice(0, varType.cols).indexOf(val) < 0))
              ) {
                throw new Error(
                  `unknown swizzle target: ${this.$ast.toString(
                    currentProgramBuilder.device.type
                  )}[${prop}]`
                );
              }
              const type = PBPrimitiveTypeInfo.getCachedTypeInfo(varType.resizeType(1, prop.length));
              exp = new PBShaderExp('', type);
              exp.$ast = new ASTHash(this.$ast, prop, type);
            }
          } else {
            if (varType.isArrayType()) {
              exp = this.at(num);
            } else if (varType.isPrimitiveType() && varType.isVectorType()) {
              if (num >= varType.cols) {
                throw new Error(`component index out of bounds: ${this.$str}[${num}]`);
              }
              exp = this.$get('xyzw'[num]);
            } else if (varType.isPrimitiveType() && varType.isMatrixType()) {
              const type = PBPrimitiveTypeInfo.getCachedTypeInfo(varType.resizeType(1, varType.cols));
              exp = new PBShaderExp('', type);
              exp.$ast = new ASTArrayIndex(this.$ast, new ASTScalar(num, typeI32), type);
            } else {
              throw new Error(`invalid index operation: ${this.$str}[${num}]`);
            }
          }
          this.$memberCache[prop] = exp;
        }
        return exp;
      }
    } else {
      return undefined;
    }
  }
  /** @internal */
  protected $set(prop: string, value: any): boolean {
    if (typeof prop === 'string') {
      if (prop[0] === '$' || prop in this) {
        this[prop] = value;
      } else {
        if (typeof value !== 'number' && typeof value !== 'boolean' && !(value instanceof PBShaderExp)) {
          throw new Error(`Invalid output value assignment`);
        }
        const varType = this.$ast?.getType() || this.$typeinfo;
        const num = Number(prop);
        if (Number.isNaN(num)) {
          if (varType.isStructType()) {
            const elementIndex = varType.structMembers.findIndex((val) => val.name === prop);
            if (elementIndex < 0) {
              throw new Error(`unknown struct member '${prop}`);
            }
            const element = varType.structMembers[elementIndex];
            let dstAST: ASTExpression;
            if (typeof value === 'number' || typeof value === 'boolean') {
              if (!element.type.isPrimitiveType() || !element.type.isScalarType()) {
                throw new Error(`can not set struct member '${prop}: invalid value type`);
              }
              dstAST = new ASTScalar(value, element.type);
            } else if (value instanceof PBShaderExp) {
              dstAST = value.$ast;
            }
            if (!dstAST) {
              throw new Error(`can not set struct member '${prop}: invalid value type`);
            }
            currentProgramBuilder
              .currentScope()
              .$ast.statements.push(
                new ASTAssignment(
                  new ASTLValueHash(new ASTLValueScalar(this.$ast), prop, element.type),
                  dstAST
                )
              );
          } else {
            // FIXME: WGSL does not support l-value swizzling
            if (prop.length > 1 || ('xyzw'.indexOf(prop) < 0 && 'rgba'.indexOf(prop) < 0)) {
              throw new Error(`invalid index operation: ${this.$str}[${num}]`);
            }
            if (!varType.isPrimitiveType() || !varType.isVectorType()) {
              throw new Error(`invalid index operation: ${this.$str}[${num}]`);
            }
            const type = PBPrimitiveTypeInfo.getCachedTypeInfo(varType.scalarType);
            currentProgramBuilder
              .currentScope()
              .$ast.statements.push(
                new ASTAssignment(
                  new ASTLValueHash(new ASTLValueScalar(this.$ast), prop, type),
                  value instanceof PBShaderExp ? value.$ast : value
                )
              );
          }
        } else {
          if (varType.isArrayType()) {
            this.setAt(num, value);
          } else if (varType.isPrimitiveType() && varType.isVectorType()) {
            if (num >= varType.cols) {
              throw new Error(`component index out of bounds: ${this.$str}[${num}]`);
            }
            this.$set('xyzw'[num], value);
          } else if (varType.isPrimitiveType() && varType.isMatrixType()) {
            if (!(value instanceof PBShaderExp)) {
              throw new Error(`invalid matrix column vector assignment: ${this.$str}[${num}]`);
            }
            const type = PBPrimitiveTypeInfo.getCachedTypeInfo(varType.resizeType(1, varType.cols));
            currentProgramBuilder
              .currentScope()
              .$ast.statements.push(
                new ASTAssignment(
                  new ASTLValueArray(new ASTLValueScalar(this.$ast), new ASTScalar(num, typeI32), type),
                  value.$ast
                )
              );
          } else {
            throw new Error(`invalid index operation: ${this.$str}[${num}]`);
          }
        }
      }
      return true;
    }
    return false;
  }
}
