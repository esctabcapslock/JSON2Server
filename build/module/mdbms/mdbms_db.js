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
exports.MDBMS_DB = void 0;
const mdbms_type_1 = require("./mdbms_type");
const sort_functions_1 = require("../sort_functions");
class MDBMS_DB {
    constructor(key, path, dir, file) {
        if (typeof file.__type != 'string')
            throw ('[__tpye string 아님');
        if (typeof key != 'string')
            throw ('[__tpye string 아님');
        const __path = (0, sort_functions_1.parse_connect_pathname)(path, file.__path ? file.__path : key);
        const __dir = (0, sort_functions_1.parse_connect_pathname)(dir, file.__dir ? file.__dir : key);
        this.path = __path;
        this.dir = __dir;
        this.quarylimit = file.quarylimit;
        this.file = new mdbms_type_1.Dbfile(file.__type, __path, __dir, file.quarylimit);
        (0, sort_functions_1.createpath)(this.dir);
        this.parsesetting(file);
        this.setup();
    }
    get getpath() { return this.path; }
    parsesetting(file) {
        function check___access(tmp) {
            if (!Array.isArray(tmp) || tmp.length != 4 || !tmp.every(v => (typeof v == 'string')))
                return false;
            else
                return true;
        }
        // this.
        // this.settime = setting
        // this.settime.__path = setting.__path?setting.__path:'/db'
        // this.settime.__dir = setting.__dir?setting.__dir:'/db'
        // for (const  key in setting){
        // if (key.startsWith('__') && !['__type','__path','__dir'].includes(key)) throw('[parsesetting], key없음 '+key)
        // const file = setting[key] as dbfile
        // if (typeof file != 'object') throw('[parsesetting] 잘못된 객체');
        // file.__path = parse_connect_pathname(this.settime.__path,file.__path?file.__path:key)
        // file.__dir = parse_connect_pathname(this.settime.__dir,file.__dir?file.__dir:key)
        // const _cfile = create_dbfile(file.__path,file.__dir)
        // this.settime[key] = _cfile
        const _cfile = this.file;
        for (const key_table in file) { //__name:string,__access
            if (key_table.startsWith('__')) {
                if (!['__access', '__type', '__path', '__name', '__dir'].includes(key_table))
                    throw ('[parsesetting], tablename key없음 ' + key_table);
                else
                    continue;
            }
            const _talbe = file[key_table]; // as dbtable
            if (typeof _talbe != 'object')
                throw ('[parsesetting _talbe] 잘못된 객체' + _talbe);
            if (!check___access(_talbe.__access))
                throw ('[parsesetting check___access] 잘못된 객체');
            const _ctalbe = new mdbms_type_1.Dbtable(key_table, _talbe.__access);
            _cfile.data[key_table] = _ctalbe;
            for (const key_attribute in _talbe) {
                if (key_attribute.startsWith('__')) {
                    if (!['__primarykey', '__autoincrement', '__notnull', '__access', '__type', '__unique', '__default', '__check', '__foreignkey'].includes(key_attribute))
                        throw ('[parsesetting], key_attribute key없음 ' + key_attribute);
                    else
                        continue;
                }
                const _attribute = _talbe[key_attribute]; // as dbattribute
                if (typeof _attribute != 'object')
                    throw ('[parsesetting _attribute] 잘못된 객체' + key_attribute + _attribute);
                if (typeof _attribute.__name != 'string')
                    _attribute.__name = key_attribute; // throw('[parsesetting _attribute.__name] 잘못된 값');
                if (!check___access(_attribute.__access) && _attribute.__access != undefined)
                    throw ('[parsesetting check___access] 잘못된 객체' + _attribute.__access);
                if (typeof _attribute.__type != 'string')
                    throw ('[parsesetting _attribute.__type] 잘못된 값');
                _ctalbe.data[key_attribute] = new mdbms_type_1.Dbattribute(_attribute);
                // __name:string,__access:string[4],__type
            }
        }
        // tablename
        // }
        return this;
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            // 체크하는 부분
            const checked = true;
            // 값이 존재하면 사실 하기
            if (checked)
                return true;
            // DB 설정 코드
            return true;
        });
    }
    //데이터 읽기
    get(table, attribute, where = null, option = null) {
        return __awaiter(this, void 0, void 0, function* () {
            // this.setup()
            return [];
        });
    }
    //데이터 추가
    post(table, attribute, option = null) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    //데이터 수정
    put(table, attribute, where, option = null) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    //데이터 삭제
    delete(table, where, option = null) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.MDBMS_DB = MDBMS_DB;
