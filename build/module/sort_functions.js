"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check_string_array = exports.array_value_equal = exports.createpath = exports.is_string_array = exports.remove_high_dir = exports.parse_connect_pathname = exports.parse_pathname = void 0;
const fs_1 = require("fs");
function parse_pathname(path) {
    return path.replace(/\\/gi, '/').replace(/^(\.?)\//, '').replace(/\/$/, '');
}
exports.parse_pathname = parse_pathname;
function parse_connect_pathname(lpath, rpath) {
    if (rpath.startsWith('/'))
        return '/' + parse_pathname(rpath);
    else
        return lpath + '/' + parse_pathname(rpath);
}
exports.parse_connect_pathname = parse_connect_pathname;
//path.ts의 함수
// function parse_pathname(path:string){
//     return path.replace(/^(\.?)\//,'').replace(/\/$/,'')
// }
function remove_high_dir(path) {
    const ar = parse_pathname(path).split('/');
    ar.pop();
    return ar.join('/');
}
exports.remove_high_dir = remove_high_dir;
function is_string_array(obj) {
    if (!Array.isArray(obj))
        return false;
    return obj.every(v => typeof v == 'string');
}
exports.is_string_array = is_string_array;
function createpath(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const ar = parse_pathname(path).split('/');
        ar.pop();
        let d = '';
        for (const dir of ar) {
            d += dir;
            if (!d)
                continue;
            console.log('createpath]', d);
            if (!(0, fs_1.existsSync)(d))
                (0, fs_1.mkdirSync)(d);
        }
    });
}
exports.createpath = createpath;
function array_value_equal(arr1, arr2) {
    return arr1.every(v => arr2.includes(v)) && arr2.every(v => arr1.includes(v));
}
exports.array_value_equal = array_value_equal;
function check_string_array(arr) {
    if (!arr.every(v => typeof v == 'string'))
        throw ('error not string[]');
    else
        return arr;
}
exports.check_string_array = check_string_array;
