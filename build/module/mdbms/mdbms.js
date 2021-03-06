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
// import * as sqlite3 from 'sqlite3'
const sort_functions_1 = require("../sort_functions");
const mdbms_type_1 = require("./mdbms_type");
const mdbms_sqlite_1 = require("./mdbms_sqlite");
class MBDMS {
    constructor(setting) {
        const __path = (0, sort_functions_1.parse_pathname)(setting.__path ? setting.__path : 'db');
        const __dir = (0, sort_functions_1.parse_pathname)(setting.__dir ? setting.__dir : 'db');
        this.__path = __path;
        this.__dir = __dir;
        this.dbmses = {};
        (0, sort_functions_1.createpath)(this.__dir);
        for (const key in setting) {
            if (key.startsWith('__')) {
                if (!['__path', '__dir'].includes(key))
                    throw ('[parsesetting], keyìì ' + key);
                else
                    continue;
            }
            const file = setting[key]; // as dbfile
            if (typeof file.__type != 'string')
                throw (`[__tpye string ìë, file.__type:${file.__type}, key:${key}`);
            const __type = file.__type.toLocaleLowerCase();
            if (__type == 'sqlite' || __type == 'sqlite3') {
                this.dbmses[key] = new mdbms_sqlite_1.MDBMS_SQLite(key, __path, __dir, file);
            }
            else
                throw ('ì´ìí type');
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
    //     // RESTful APIì ë§ëë¡ ì¤ê³í´ë³´ì
    //     // http://localhost/[__dir]/[tablename]/[attribute]?value=[value] ì´ë°ìì¼ë¡ ë§ë¤ê¹?
    //     // GET(ì½ê¸°), GET, POST(ìì±), PUT(ìì ), DELETE(ì­ì )
    //     // ìë¥¼ ë¤ë©´ ììì¬ìê¸°ìì, ê³¡ì ë³´, ìë²ì ë³´ ì½ì´ì ëìì ê°ì ¸ìëê±´? ë¤ì ë§í´ joinì ì²ë¦¬ ëª»íëê±´ ì´ì¼íì§? í´ë¼ì´ì¸í¸ìì ì²ë¦¬íë©´?
    //     // ì ì¡ ì¤ë²í´ëê° ì»¤ì§ ì(ììì§ ìë)ìê³ , í´ë¼ì´ì¸í¸ê° íë¤ì´í¨;;;, ìë²ì¸¡ ì½ëê° ê°ë¨íë¤!
    //     // ë´ë¶ APIììë í¸ì¶í  ì ìê²ë [parse í¨ìë¥¼ ìë²ë¶ë¶ê³¼ dbë¶ë¶ì¼ë¡ ëëì.]
    //     // seleteë¬¸, joinì ì²ë¦¬íê¸° ìí´ ê¸°ë¥ì ì¶ê°í´ì¼í¨
    //     // orderbyë ìì, limitë ê°ì ¸ì¬ ë¬¸ì ê°ì
    // }
    is_db_url(url, _method) {
        const method = _method.toLocaleUpperCase();
        if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method))
            return false;
        for (const file in this.dbmses) {
            if (this.dbmses[file].getpath == (0, sort_functions_1.parse_pathname)(url.pathname))
                return file;
        }
        return false;
    }
    parsehttp(req, res, url, method) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, rejects) => __awaiter(this, void 0, void 0, function* () {
                method = method.toLocaleUpperCase();
                const file_name = this.is_db_url(url, method);
                if (!file_name) {
                    resolve(false);
                    return;
                }
                const JSON_parse = (x) => {
                    if (x == null)
                        return null;
                    else
                        try {
                            return JSON.parse(x);
                        }
                        catch (e) {
                            rejects(`e:${e}, x:${x}`);
                        }
                };
                console.log(url);
                if (url.search) {
                    try {
                        yield this.parsedohttp(res, method, file_name, url.searchParams.get('table'), JSON_parse(url.searchParams.get('attribute')), JSON_parse(url.searchParams.get('where')), JSON_parse(url.searchParams.get('option')));
                        resolve(true);
                    }
                    catch (e) {
                        rejects(`404 ìëµ get json íí X ${e}`);
                    }
                }
                else {
                    const data = [];
                    // try{
                    // req.res
                    req.on('data', (chunk) => data.push(Buffer.from(chunk)));
                    req.on('end', () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const { file_name, table, where, attribute, option } = JSON.parse(Buffer.concat(data).toString());
                            yield this.parsedohttp(res, method, file_name, table, attribute, where, option);
                            resolve(true);
                        }
                        catch (e) {
                            rejects(`404 ìëµ json íí X ${e}`);
                        }
                    }));
                    req.on('error', () => {
                        rejects('error req');
                    });
                    // }catch(e){rejects(`404 e:${e}`)}
                }
                ;
            }));
        });
    }
    parsedohttp(res, method, file, table, attribute, where, option) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data;
                if (!table || typeof table != 'string')
                    throw ('400 error table formet');
                if (!file || typeof file != 'string')
                    throw ('400 error table formet');
                switch (method) {
                    case 'GET':
                        if (!Array.isArray(attribute) || !(0, sort_functions_1.is_string_array)(attribute))
                            throw ('err attribure err');
                        data = yield this.get(file, table, attribute, where == null ? null : new mdbms_type_1.Getattribute(where), option == null ? null : new mdbms_type_1.Getoption(option));
                        break;
                    case 'POST':
                        data = yield this.post(file, table, new mdbms_type_1.Getattribute(attribute));
                        break;
                    case 'PUT':
                        data = yield this.put(file, table, new mdbms_type_1.Getattribute(attribute), new mdbms_type_1.Getattribute(where));
                        break;
                    case 'DELETE':
                        data = yield this.delete(file, table, new mdbms_type_1.Getattribute(where));
                        break;
                    default:
                        throw ('[err] parsehttp ' + method);
                }
                //return {code:200,header:{'Content-Type':'text/json;charset=utf-8'}, data}
                res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
                res.end(data != undefined ? JSON.stringify(data) : '{}');
            }
            catch (e) {
                throw (`404 [parsedohttp] e:${e}`);
            }
        });
    }
    get(file, table, attribute, where = null, option = null) {
        // this.setup()
        if (typeof this.dbmses[file] != 'object')
            throw ('[get] this.dbmses[file] != object');
        return this.dbmses[file].get(table, attribute, where, option);
    }
    //ë°ì´í° ì¶ê°
    // public post(file:string,table:string,attribute:string, option:any|undefined){
    post(file, table, attribute, option = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof this.dbmses[file] != 'object')
                throw ('[get] this.dbmses[file] != object');
            return this.dbmses[file].post(table, attribute, option);
        });
    }
    //ë°ì´í° ìì 
    put(file, table, attribute, where, option = null) {
        if (typeof this.dbmses[file] != 'object')
            throw ('[get] this.dbmses[file] != object');
        return this.dbmses[file].put(table, attribute, where, option);
    }
    //ë°ì´í° ì­ì 
    delete(file, table, where, option = null) {
        if (typeof this.dbmses[file] != 'object')
            throw ('[get] this.dbmses[file] != object');
        return this.dbmses[file].delete(table, where, option);
    }
}
exports.MBDMS = MBDMS;
