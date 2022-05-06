"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_string_array = exports.remove_high_dir = exports.parse_connect_pathname = exports.parse_pathname = void 0;
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
