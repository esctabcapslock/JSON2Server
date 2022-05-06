"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_file_dict = exports.create_path_dict = void 0;
function create_path_dict() {
    const out = {
        __isdirectory: true,
        __allow: [],
        __disallow: [],
        __type: 'file',
        __access: undefined,
        __dir: undefined,
    };
    return out;
}
exports.create_path_dict = create_path_dict;
function create_file_dict() {
    const out = {
        __isdirectory: false,
        __type: 'file',
        __access: undefined,
        __dir: undefined,
    };
    return out;
}
exports.create_file_dict = create_file_dict;
