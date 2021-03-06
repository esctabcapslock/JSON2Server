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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("./module/path"));
const file_1 = require("./module/file");
const http_1 = require("http");
const mdbms_1 = require("./module/mdbms");
const sort_functions_1 = require("./module/sort_functions");
// import {setting} from './server'
// console.log('[setting]',setting);
function main(setting) {
    return __awaiter(this, void 0, void 0, function* () {
        const { port } = setting;
        const path = new path_1.default();
        const mdbms = new mdbms_1.MBDMS(setting.db);
        path.parse_setting_json(setting);
        // db에 
        (0, http_1.createServer)((req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.url === undefined)
                    throw ("url이 undefined");
                if (req.headers.host === undefined)
                    throw ("host가 undefined");
                if (req.method === undefined)
                    throw ("method가 undefined");
                // const url = req.url
                // const host = req.headers.host
                const url = new URL(`http://${req.headers.host}/${(0, sort_functions_1.parse_pathname)(req.url)}`);
                const method = req.method.toUpperCase();
                // db 요청인지 확인
                if (yield mdbms.parsehttp(req, res, url, method))
                    return true;
                // console.log(url,req.headers.host)
                const { type, todo } = yield path.parse(req, res);
                if (type == 'file') {
                    yield (0, file_1.writefile)(res, todo, req.headers.range);
                }
                else if (type == 'api') {
                    res.end('1');
                }
                else {
                    throw ('알 수 없는 type 오류');
                }
            }
            catch (e) {
                console.log('[error--]', e);
                const code_tmp = String(e).match(/\d+/);
                if (code_tmp)
                    res.statusCode = Number(code_tmp[0]);
                else
                    res.statusCode = 404;
                res.writeHead(code_tmp ? Number(code_tmp[0]) : 404, {
                    "Content-Type": 'text/plain; charset=utf-8',
                });
                res.end(e); //이거 고처야 함. 정식 릴리즈에는 사용자에게 에러를 보아면 안됨.
            }
        })).listen(port, () => console.log(`Server is running at port ${port}`));
    });
}
exports.default = main;
