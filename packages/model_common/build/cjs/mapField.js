"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_decorator_1 = require("@bfchain/util-decorator");
/**
 * 传入一个普通的object对象，其属性会被当做Map一样操作
 */
class TypedMap {
    constructor(_hm, parseMapToEntries) {
        this._hm = _hm;
        this._m = new Map(parseMapToEntries(_hm));
    }
    /**
     * 因为`set`会在构造函数调用`super`的时候去运作，那时候`._map`属性还没赋值，所以延迟设置
     */
    set(key, val) {
        this._m.set(key, val);
        this._hm[key] = val;
        return this;
    }
    delete(key) {
        delete this._hm[key];
        return this._m.delete(key);
    }
    clear() {
        for (const num in this._hm) {
            delete this._hm[num];
        }
        return this._m.clear();
    }
    toJSON() {
        const res = {};
        for (const item of this._m.entries()) {
            const value = item[1];
            res[item[0]] = value && typeof value.toJSON === "function" ? value.toJSON() : value;
        }
        return res;
    }
    //#region Map属性与方法的继承
    get has() {
        return this._m.has.bind(this._m);
    }
    get get() {
        return this._m.get.bind(this._m);
    }
    get size() {
        return this._m.size;
    }
    /** Returns an iterable of entries in the map. */
    get [Symbol.iterator]() {
        return this._m[Symbol.iterator].bind(this._m);
    }
    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    get entries() {
        return this._m.entries.bind(this._m);
    }
    /**
     * Returns an iterable of keys in the map
     */
    get keys() {
        return this._m.keys.bind(this._m);
    }
    /**
     * Returns an iterable of values in the map
     */
    get values() {
        return this._m.values.bind(this._m);
    }
    get [Symbol.toStringTag]() {
        return "TypedMap";
    }
}
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedMap.prototype, "has", null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedMap.prototype, "get", null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedMap.prototype, Symbol.iterator, null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedMap.prototype, "entries", null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedMap.prototype, "keys", null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedMap.prototype, "values", null);
class NumberKeyMap extends TypedMap {
    constructor(map) {
        super(map, map => Object.keys(map).map(num => [Number.parseInt(num), map[num]]));
    }
}
exports.NumberKeyMap = NumberKeyMap;
class StringKeyMap extends TypedMap {
    constructor(map) {
        super(map, map => Object.entries(map));
    }
}
exports.StringKeyMap = StringKeyMap;
class TypedSet {
    constructor(_l) {
        this._l = _l;
        this._s = new Set(_l);
    }
    add(item) {
        if (!this._s.has(item)) {
            this._l.push(item);
            this._s.add(item);
        }
        return this;
    }
    delete(item) {
        if (this._s.delete(item)) {
            const index = this._l.indexOf(item);
            this._l.splice(index, 1);
            return true;
        }
        return false;
    }
    clear() {
        this._s.clear();
        this._l.length = 0;
    }
    //#region Set属性与方法的继承
    get has() {
        return this._s.has.bind(this._s);
    }
    get size() {
        return this._s.size;
    }
    /** Returns an iterable of entries in the map. */
    get [Symbol.iterator]() {
        return this._s[Symbol.iterator].bind(this._s);
    }
    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    get entries() {
        return this._s.entries.bind(this._s);
    }
    /**
     * Returns an iterable of keys in the map
     */
    get keys() {
        return this._s.keys.bind(this._s);
    }
    /**
     * Returns an iterable of values in the map
     */
    get values() {
        return this._s.values.bind(this._s);
    }
    get [Symbol.toStringTag]() {
        return "TypedSet";
    }
}
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedSet.prototype, "has", null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedSet.prototype, Symbol.iterator, null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedSet.prototype, "entries", null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedSet.prototype, "keys", null);
__decorate([
    util_decorator_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], TypedSet.prototype, "values", null);
class StringSet extends TypedSet {
}
exports.StringSet = StringSet;
class NumberSet extends TypedSet {
}
exports.NumberSet = NumberSet;
//# sourceMappingURL=mapField.js.map