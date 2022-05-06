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
exports.MBDMS = void 0;
const sort_functions_1 = require("./sort_functions");
const mdbms_type_1 = require("./mdbms_type");
class MBDMS {
    constructor(setting) {
        const __path = (setting.__path ? setting.__path : 'db');
        const __dir = (setting.__dir ? setting.__dir : 'db');
        this.__path = __path;
        this.__dir = __dir;
        this.dbmses = {};
        for (const key in setting) {
            if (key.startsWith('__')) {
                if (!['__path', '__dir'].includes(key))
                    throw ('[parsesetting], key없음 ' + key);
                else
                    continue;
            }
            const file = setting[key];
            if (typeof file.__type != 'string')
                throw ('[__tpye string 아님');
            const __type = file.__type.toLocaleLowerCase();
            if (__type == 'sqlite' || __type == 'sqlite3') {
                this.dbmses[key] = new DBMS_SQLite(key, __path, __dir, file);
            }
            else
                throw ('이상한 type');
        }
        // this.settime = setting
    }
    // public async parsehttp(req:IncomingMessage,res:ServerResponse){
    //     const method = req.method?.toUpperCase()
    //     const url = new URL(req.url?req.url:'', `http://${req.headers.host}`);
    //     const pathname = decodeURI(url.pathname)
    //     const searchParams = url.searchParams
    //     let data;
    //     if (method=='POST') data = await post_parse(req,res)
    //     // RESTful API에 맞도록 설계해보자
    //     // http://localhost/[__dir]/[tablename]/[attribute]?value=[value] 이런식으로 만들까?
    //     // GET(읽기), GET, POST(생성), PUT(수정), DELETE(삭제)
    //     // 예를 들면 음악재생기에서, 곡정보, 엘범정보 읽어서 동시에 가져왔던건? 다시 말해 join을 처리 못하는건 어케하지? 클라이언트에서 처리하면?
    //     // 전송 오버해드가 커질 수(작아질 수도)있고, 클라이언트가 힘들어함;;;, 서버측 코드가 간단하다!
    //     // 내부 API에서도 호출할 수 있게끔 [parse 함수를 서버부분과 db부분으로 나누자.]
    //     // selete문, join을 처리하기 위해 기능을 추가해야함
    //     // orderby는 순서, limit는 가져올 문서 개수
    // }
    parsehttp(res, method, file, table, attribute, option) {
        return __awaiter(this, void 0, void 0, function* () {
            const _method = method.toLocaleLowerCase();
            let data;
            if (_method == 'get')
                data = this.get(file, table, attribute, option);
            else if (_method == 'post')
                data = this.post(file, table, attribute, option);
            else if (_method == 'put')
                data = this.put(file, table, attribute, option);
            else if (_method == 'delete')
                data = this.delete(file, table, attribute, option);
            else
                throw ('[err] parsehttp' + _method);
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(data != undefined ? JSON.stringify(data) : '{}');
        });
    }
    get(file, table, attribute, option) {
        // this.setup()
        if (typeof this.dbmses[file] != 'object')
            throw ('[get] this.dbmses[file] != object');
        return this.dbmses[file].get(table, attribute, option);
    }
    //데이터 추가
    post(file, table, attribute, option) {
        if (typeof this.dbmses[file] != 'object')
            throw ('[get] this.dbmses[file] != object');
        return this.dbmses[file].post(table, attribute, option);
    }
    //데이터 수정
    put(file, table, attribute, option) {
        if (typeof this.dbmses[file] != 'object')
            throw ('[get] this.dbmses[file] != object');
        return this.dbmses[file].put(table, attribute, option);
    }
    //데이터 삭제
    delete(file, table, attribute, option) {
        if (typeof this.dbmses[file] != 'object')
            throw ('[get] this.dbmses[file] != object');
        return this.dbmses[file].delete(table, attribute, option);
    }
}
exports.MBDMS = MBDMS;
class MDBMS_DB {
    constructor(key, path, dir, file) {
        if (typeof file.__type != 'string')
            throw ('[__tpye string 아님');
        if (typeof key != 'string')
            throw ('[__tpye string 아님');
        const __path = (0, sort_functions_1.parse_connect_pathname)(path, file.__path ? file.__path : key);
        const __dir = (0, sort_functions_1.parse_connect_pathname)(dir, file.__dir ? file.__dir : key);
        this.__path = __path;
        this.__dir = __dir;
        this.file = (0, mdbms_type_1.create_dbfile)(file.__type, __path, __dir);
        this.parsesetting(file);
        this.setup();
    }
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
            const _talbe = file[key_table];
            if (typeof _talbe != 'object')
                throw ('[parsesetting _talbe] 잘못된 객체' + _talbe);
            if (!check___access(_talbe.__access))
                throw ('[parsesetting check___access] 잘못된 객체');
            const _ctalbe = (0, mdbms_type_1.create_dbtable)(key_table, _talbe.__access);
            _cfile[key_table] = _ctalbe;
            for (const key_attribute in _talbe) {
                if (key_attribute.startsWith('__')) {
                    if (!['__primarykey', '__autoincrement', '__notnull'].includes(key_attribute))
                        throw ('[parsesetting], key_attribute key없음 ' + key_attribute);
                    else
                        continue;
                }
                const _attribute = _talbe[key_attribute];
                if (typeof _attribute != 'object')
                    throw ('[parsesetting _attribute] 잘못된 객체');
                if (typeof _attribute.__name != 'string')
                    _attribute.__name = key_attribute; // throw('[parsesetting _attribute.__name] 잘못된 값');
                if (!check___access(_attribute.__access))
                    throw ('[parsesetting check___access] 잘못된 객체');
                if (typeof _attribute.__type != 'string')
                    throw ('[parsesetting _attribute.__type] 잘못된 값');
                _ctalbe[key_attribute] = (0, mdbms_type_1.create_dbattribute)(_attribute);
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
    get(table, attribute, option) {
        // this.setup()
    }
    //데이터 추가
    post(table, attribute, option) {
    }
    //데이터 수정
    put(table, attribute, option) {
    }
    //데이터 삭제
    delete(table, attribute, option) {
    }
}
class DBMS_SQLite extends MDBMS_DB {
    constructor(key, path, dir, setting) {
        super(key, path, dir, setting);
        this.sqlite3 = require('sqlite3').verbose();
        // this.setup()
    }
    setup() {
        return new Promise((resolve, rejects) => {
            console.log('setting]t his.__dir', this.__dir);
            if (!this.sqlite3)
                this.sqlite3 = require('sqlite3').verbose();
            const db = new this.sqlite3.Database(this.__dir);
            console.log('setting]t his.__dir2', this.__dir, db);
            db.serialize(() => {
                db.run("CREATE TABLE lorem (info TEXT)");
                const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
                for (let i = 0; i < 10; i++) {
                    stmt.run("Ipsum " + i);
                }
                stmt.finalize();
                db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
                    console.log(row.id + ": " + row.info);
                });
                resolve(true);
            });
            db.close();
        });
    }
    //데이터 읽기
    get(table, attribute, option) {
        // this.setup()
    }
    //데이터 추가
    post(table, attribute, option) {
        return new Promise((resolve, rejects) => {
            const db = new this.sqlite3.Database(this.__dir);
            db.serialize(() => {
                db.get(`selete * FROM $table `, { table }, (err, data) => {
                    if (err)
                        throw ('ewer');
                    return data;
                });
            });
        });
    }
    //데이터 수정
    put(table, attribute, option) {
    }
    //데이터 삭제
    delete(table, attribute, option) {
    }
    sqlinjection(str) {
        // SELECT "INSERT" from "SELECT"이딴거
        if (/\s|"|'|=|*/gi.test(str))
            throw ('err sql not inval');
        return str;
    }
}
const mBDMS = new MBDMS({ db1: { __type: "sqlite3", __path: undefined, __dir: undefined } });
mBDMS.post('db1', 'students', 'krr', undefined); // 추가
mBDMS.get('db1', 'students', 'krr', { order: 'min' }); // 데이터 읽기
// mBDMS.get()
