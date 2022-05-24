"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Getorder = exports.Getas = exports.Getjoin = exports.Getoption = exports.Getattribute = exports.Dbattribute = exports.Dbtable = exports.Dbfile = void 0;
const sort_functions_1 = require("../sort_functions");
// {[key:string]:string|number|null}
// export function create_dbfile(type:string,path:string, dir:string, limit:number|undefined):dbfile{
//     const out:dbfile = {
//         __type:type,
//         __path:path,
//         __dir:dir,
//         __crossorigin:undefined,
//         __quarylimit:limit
//     }
//     return out
// }
class Dbfile {
    constructor(type, path, dir, limit) {
        this.type = type;
        this.path = path;
        this.dir = dir;
        this.crossorigin = undefined;
        this.quarylimit = limit;
        this.data = {};
    }
    tablestring2table(table) {
        // this.sqlinjection(table)
        if (!this.data[table])
            throw (`[check_valid_table] table(${table}) 없어`);
        return this.data[table];
    }
    check_accessible_getoption(table, option, keycheckfn) {
        // join의 값들 유효성 확인
        if (option.join)
            if (!option.join.getlist().every(val => {
                var _a;
                if (!option || !option.join)
                    throw ('뭔기 이상함');
                this.check_accessible_attribute_with_dot(table, val, keycheckfn);
                const [tablename, attributename] = (_a = option.join) === null || _a === void 0 ? void 0 : _a.get(val);
                this.tablestring2table(tablename).check_valid_table(1).check_accessible_attribute(1, attributename);
            }))
                throw ('option join 유효X');
        //as의 값들 유효성 확인
        if (option.as)
            if (!option.as.getlist().every(val => {
                if (!option || !option.as)
                    throw ('뭔기 이상함');
                this.check_accessible_attribute_with_dot(table, val, keycheckfn);
                keycheckfn(option.as.get(val));
            }))
                throw ('option as 유효X');
        if (!option.limit && this.quarylimit)
            option.limit = this.quarylimit;
        if (Number.isInteger(!option.limit))
            throw ('limit 잘못됨');
        if (option.order) {
            this.check_accessible_attribute_with_dot(table, option.order.column, keycheckfn);
            // if(!["ASC","DESC"].includes(option.order.order)) throw("opt oredr 잘못됨")
        }
    }
    check_accessible_attribute_with_dot(_table, _attribute, keycheckfn) {
        if (!_table && !_attribute.includes('.'))
            throw ('_attribute에 점이 없음');
        if (_attribute.includes('.')) {
            const [tablename, attributename] = _attribute.split('.');
            if (this.tablestring2table(tablename).check_accessible_attribute(1, keycheckfn(attributename)))
                return true;
            else
                false;
        }
        else if (this.tablestring2table(_table).check_accessible_attribute(1, keycheckfn(_attribute)))
            return true;
        else
            return false;
    }
}
exports.Dbfile = Dbfile;
// export function create_dbtable(name:string,access:accesstype):dbtable{
//     const out:dbtable = {
//         __name:name,
//         __access:access
//     }
//     return out
// }
class Dbtable {
    constructor(name, access) {
        this.name = name;
        this.access = access;
        this.data = {};
    }
    get_attribute(attributekey) {
        // if(attributekey.startsWith('__')) throw('attributename __로 시작'+attributekey)
        if (!this.data[attributekey])
            throw ('attributename __로 시작' + attributekey);
        // if(typeof _table.data[attributekey] != 'object') throw('_table[attributename] 객체아님'+attributekey)
        return this.data[attributekey];
    }
    is_unique_attribute(attribute) {
        const __prkey_attribute = [];
        const __unique_attribute = [];
        for (const key in this.data)
            if (!key.startsWith('__')) {
                const at = this.get_attribute(key);
                if (at.primarykey)
                    __prkey_attribute.push(key);
                if (at.unique)
                    __unique_attribute.push(key);
            }
        // 모든 prkey가 있으면 ok
        if (__prkey_attribute.every(v => attribute.includes(v)))
            return true;
        // 하나의 uniqukey가 있어도 ok
        if (__unique_attribute.some(v => attribute.includes(v)))
            return true;
        return false;
    }
    check_valid_table(accesstype) {
        // if(table.startsWith('__') ) throw('[check_valid_table] table __로 시작')
        // if( !this.file.data[table]) throw(`[check_valid_table] table(${table}) 없어`)
        // if(typeof this.file.data[table] != 'object') throw('this.file[table] 객체아님')
        // const _table = this.file.data[table]
        if (!this.access || this.access[accesstype] != 'all')
            throw ('[check_valid_table] 권한 없음 ' + this);
        return this;
    }
    check_modifiable_attribute(accesstype, attributename, value) {
        // 접근할 수 있는지 체크
        const _attribute = this.check_accessible_attribute(accesstype, attributename);
        //notnull 체크
        if (value == null && _attribute.notnull)
            throw ('notnull error' + attributename);
        // __autoincrement 체크
        if (_attribute.autoincrement)
            throw ('__autoincrement error' + attributename);
        //filiter체크
        if (_attribute.filiter)
            if (!_attribute.filiter.test(String(value)))
                throw ('_attribute.__filiter 만족 x ' + _attribute.filiter);
        return _attribute;
    }
    check_accessible_attribute(accesstype, attributename) {
        const _attribute = this.get_attribute(attributename); // _table[attributename]  as dbattribute
        //권한체크
        if (_attribute.access[1] != 'all')
            throw ('권한 없음');
        return _attribute;
    }
    check_getattribute(attribute, keycheckfn, typecheckfn) {
        const attribute_array = [];
        const sql_dict = {};
        for (const key of attribute.getlist()) {
            keycheckfn(key); // 표준보다 강력해지는것(?) 안 하면 골치아프다.
            const at = this.check_accessible_attribute(1, key);
            typecheckfn(at.type, attribute.get(key));
            attribute_array.push(key);
            sql_dict['$' + key] = attribute.get(key);
        }
        return [attribute_array, sql_dict];
    }
    check_getattribute_where(attribute, unique, keycheckfn, typecheckfn) {
        // const _table = this.tablestring2table(table)
        const [attribute_array, sql_dict] = this.check_getattribute(attribute, keycheckfn, typecheckfn);
        if (unique)
            if (!this.is_unique_attribute(attribute_array))
                throw (`check_getattribute_where error table:${this} attribute:${attribute}`);
        return [attribute_array, sql_dict];
    }
}
exports.Dbtable = Dbtable;
// export function create_dbattribute(option:dbattribute):dbattribute{
class Dbattribute {
    constructor(option) {
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
        if (option.__autoincrement) {
            if (option.__type.toUpperCase() != 'INTEGER')
                throw (`name:${option.__name} __type이 정수 아니면 ${+option.__type} option.__autoincrement false`);
            if (!option.__primarykey)
                throw ('option.__autoincrement true면 __primarykey must be true');
        }
        //사용자 지정 타입은 허용X
        // https://www.sqlite.org/datatype3.html
        let __type = option.__type.toUpperCase();
        const ColumnAffinity = {
            'INT': "INTEGER",
            'CHAR': "TEXT",
            'STRING': "TEXT",
            'CLOB': "TEXT",
            'FLOA': "REAL",
            'FLOAT': "REAL",
            'DOUB': "REAL",
            'DOUBLE': "REAL",
            'DATE': "NUMERIC",
            'DATETIME': "NUMERIC"
        };
        if (__type in ColumnAffinity)
            __type = ColumnAffinity[__type];
        if (!['NULL', 'INTEGER', 'REAL', 'TEXT', 'BLOB', 'NUMERIC'].includes(__type))
            throw ('option.__type not ' + __type);
        //filiter
        if (typeof option.__name != 'string')
            throw ('option name is not string');
        if (option.__filiter != undefined && !(option.__filiter instanceof RegExp))
            option.__filiter = RegExp(option.__filiter);
        if (__type == 'BLOB')
            option.__filiter = undefined;
        // const out:dbattribute = {
        //     __name:option.__name,
        //     __access:option.__access?option.__access:['all','all','all','all'],
        //     __type:__type,
        //     __primarykey:Boolean(option.__primarykey),
        //     __autoincrement:Boolean(option.__autoincrement),
        //     __notnull:Boolean(option.__notnull),
        //     __unique:Boolean(option.__unique),
        //     __default:option.__default,
        //     __check:option.__check,
        //     __foreignkey:option.__foreignkey,
        //     __filiter:option.__filiter
        // }
        // return out
        this.name = option.__name,
            this.access = option.__access ? option.__access : ['all', 'all', 'all', 'all'],
            this.type = __type,
            this.primarykey = Boolean(option.__primarykey),
            this.autoincrement = Boolean(option.__autoincrement),
            this.notnull = Boolean(option.__notnull),
            this.unique = Boolean(option.__unique),
            this.default = option.__default,
            this.check = option.__check,
            this.foreignkey = option.__foreignkey,
            this.filiter = option.__filiter;
    }
}
exports.Dbattribute = Dbattribute;
// export type getoption = {join:undefined|getjoin, as:getas|undefined, limit:undefined|null|number, order:undefined|getorder}
// export type getjoin = {[key:string]:[string,string]} //Join {"table1.file1": [table2,field2], … }
// export type getas = {[key:string]:string} //Join {"table1.file1": nickname, … }
// export type getorder = {column:string,order:"ASC"|"DESC"} //Join {"table1.file1": [table2,field2], … }
// export type getattribute = {[key:string]:string|number}
class Getattribute {
    constructor(obj) {
        if (typeof obj != 'object')
            throw ('객체가 아님');
        for (const key in obj) {
            if (typeof key != 'string')
                throw ('key 문자가 아님');
            if (!['string', 'number'].includes(typeof obj[key]) && !Buffer.isBuffer(obj[key]))
                throw ('obj[key] 타입 다르다');
        }
        this.dict = obj;
    }
    get(key) { return this.dict[key]; }
    getlist() { return dictkeylist(this.dict); }
}
exports.Getattribute = Getattribute;
class Getoption {
    // constructor(join:undefined|Getjoin, as:Getas|undefined, limit:undefined|number, order:undefined|Getorder){
    //     this.join = join
    //     this.as = as
    //     this.limit = limit
    //     this.order = order
    // }
    constructor(obj) {
        if (typeof obj != 'object')
            throw ('객체가 아님');
        for (const key in obj) {
            switch (key) {
                case 'join':
                    if (typeof obj[key] != 'object' || obj[key] != undefined)
                        throw (`${key} 타입 오류`);
                    this.join = typeof obj[key] == 'object' ? new Getjoin(obj[key]) : undefined;
                    break;
                case 'as':
                    if (typeof obj[key] != 'object' || obj[key] != undefined)
                        throw (`${key} 타입 오류`);
                    this.as = typeof obj[key] == 'object' ? new Getas(obj[key]) : undefined;
                    break;
                case 'limit':
                    if (!(obj[key] == undefined || (Number.isInteger(obj[key]) && obj[key] >= 0)))
                        throw (`${key} 타입 오류`);
                    this.limit = obj[key];
                    break;
                case 'order':
                    if (typeof obj[key] != 'object' || obj[key] != undefined)
                        throw (`${key} 타입 오류`);
                    this.order = typeof obj[key] == 'object' ? new Getorder(obj[key].column, obj[key].order) : undefined;
                    break;
                default:
                    throw ('값 없음, 이상한 키' + key);
            }
        }
    }
}
exports.Getoption = Getoption;
class Getjoin {
    constructor(dict) {
        this.__data = {};
        for (const key in dict)
            this.set(key, dict[key]);
        // {[key:string]:[string,string]} //Join {"table1.file1": [table2,field2], … }
    }
    get(key) { return this.__data[key]; }
    getlist() { return dictkeylist(this.__data); }
    set(key, data) {
        if (typeof key != 'string' || key === "")
            throw ('Getjoin error');
        if (key.split('.').length > 2)
            throw ('Getjoin .이 많음 error');
        if ((0, sort_functions_1.is_string_array)(data) && data.length == 2)
            this.__data[key] = data;
        else
            throw ('Getjoin error2');
    }
}
exports.Getjoin = Getjoin;
class Getas {
    constructor(dict) {
        this.__data = {};
        for (const key in dict)
            this.set(key, dict[key]);
        // {[key:string]:[string,string]} //Join {"table1.file1": [table2,field2], … }
    }
    get(key) { return this.__data[key]; }
    getlist() { return dictkeylist(this.__data); }
    set(key, data) {
        if (typeof key != 'string' || key === "")
            throw ('Getas error');
        if (key.split('.').length > 2)
            throw ('Getas .이 많음 error');
        if ((0, sort_functions_1.is_string_array)(data) && data.length == 2)
            this.__data[key] = data;
        else
            throw ('Getjoin error2');
    }
}
exports.Getas = Getas;
class Getorder {
    constructor(column, order) {
        if (typeof column != 'string' || column === "")
            throw ('error column');
        this.column = column;
        if (order != "ASC" && order != "DESC")
            throw ("Getorder error");
        this.order = order;
    }
}
exports.Getorder = Getorder;
function dictkeylist(obj) {
    const out = [];
    for (let key in obj)
        out.push(key);
    return out;
}
