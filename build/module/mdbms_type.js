"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_dbattribute = exports.create_dbtable = exports.create_dbfile = void 0;
// export function create_dbsetting():dbsetting{
//     const out:dbsetting = {
//         __type:type,
//         __path:'/db',
//         __dir:'/db',
//     }
//     return out
// }
function create_dbfile(type, path, dir) {
    const out = {
        __type: type,
        __path: path,
        __dir: dir,
    };
    return out;
}
exports.create_dbfile = create_dbfile;
function create_dbtable(name, access) {
    const out = {
        __name: name,
        __access: access
    };
    return out;
}
exports.create_dbtable = create_dbtable;
function create_dbattribute(option) {
    // FOREIGN KEY 뭐야 그동안 노가다했어 - 아 써도 노가다는 해야함
    // name:string,access:string[4],type:string,promarykey:boolean|undefined,autucount:boolean|undefined,notnull:boolean|undefined,unique:boolean|undefined,_default:any,check:string|undefined,foreignkey:string|undefined
    // 이렇게 설정하는 이유는 boolean에 대해 이상한 값이 들어가는지 체크.
    //__foreignkey의 무결성도 체크해야 할 터인데 귀찮네
    function inbBoolean(key) {
        if (typeof key != "boolean")
            return true;
        else
            return false;
    }
    const out = {
        __name: option.__name,
        __access: option.__access ? option.__access : ['all', 'all', 'all', 'all'],
        __type: option.__type,
        __primarykey: Boolean(option.__primarykey),
        __autoincrement: Boolean(option.__autoincrement),
        __notnull: inbBoolean(option.__notnull),
        __unique: Boolean(option.__unique),
        __default: option.__default,
        __check: option.__check,
        __foreignkey: option.__foreignkey
    };
    return out;
}
exports.create_dbattribute = create_dbattribute;
