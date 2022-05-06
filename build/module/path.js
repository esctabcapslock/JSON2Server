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
const digest_1 = require("../tool/digest");
const sort_functions_1 = require("./sort_functions");
const path_type_1 = require("./path_type");
class Path {
    constructor() {
        this.path_dict = (0, path_type_1.create_path_dict)();
        this.path_dict.__type = 'file';
        this.digest = new digest_1.Digest('/', () => '1234');
        this.assess = null;
        this.user_list = [];
    }
    application_path(pathname, isallow, type = undefined, access = undefined) {
        const path_arr = (0, sort_functions_1.parse_pathname)(pathname).split('/');
        if (path_arr.some(v => v.startsWith('__')))
            throw ('폴더 중 __으로 시작하는게 있음');
        const file_name = path_arr.pop();
        if (!file_name)
            throw ('[application_path] does not file_name exist');
        let root = this.path_dict;
        for (const dir of path_arr) {
            isallow ? root.__allow.push(dir) : root.__disallow.push(dir);
            if (root[dir] == undefined)
                root[dir] = (0, path_type_1.create_path_dict)();
            else if (root[dir]) {
                if (typeof root[dir] != 'object')
                    throw ('[error] 객체여야 함1');
                if (root[dir].__isdirectory)
                    throw ('[error] 폴더가 아닌게 경로에 있음');
            }
            root = root[dir];
        }
        if (root[file_name]) {
            if (typeof root[file_name] != 'object')
                throw ('[error] 객체여야 함2');
            if (root[file_name].__isdirectory)
                throw ('[error] 파일이여야 함');
        }
        root[file_name] = (0, path_type_1.create_file_dict)();
        root[file_name].__type = type;
        root[file_name].__access = access;
    }
    parse_setting_json(setting) {
        if (setting.logging) {
            if (!setting.logging.path)
                setting.logging.path = './log/log.dat';
            this.application_path(setting.logging.path, false);
        }
        if (setting.db) {
        }
        if (setting.api) {
        }
        if (setting.access) {
            this.assess = setting.access.__type;
        }
        if (setting.files) {
            const roots = [{ dir: setting.files, root: this.path_dict }];
            while (roots.length) { //주어진 입력이 정상적인지 확인하기 위해(?) 이 과정을 거침
                const { dir, root } = roots.splice(0, 1)[0];
                if (typeof dir.__isdirectory != 'boolean')
                    dir.__isdirectory = true; //정보가 없으면 폴더로 인식
                root.__isdirectory = dir.__isdirectory;
                if (root.__isdirectory) {
                    if ((0, sort_functions_1.is_string_array)(dir.__allow))
                        root.__allow = [...root.__allow, ...dir.__allow];
                    if ((0, sort_functions_1.is_string_array)(dir.__disallow))
                        root.__disallow = [...root.__disallow, ...dir.__disallow];
                }
                if (typeof dir.__access == 'string')
                    root.__access = dir.__access;
                if (!root.__access)
                    root.__access = 'all';
                if (typeof dir.__dir == 'string')
                    root.__dir = dir.__dir;
                root.__type = 'file';
                // console.log('dir-',dir)
                for (const key in dir) {
                    if (typeof key == 'string' && !key.startsWith('__')) {
                        // console.log('[while]',key)
                        if (typeof dir[key] != 'object')
                            throw ('root[key] 절못된 값이다.');
                        if (typeof dir[key].__isdirectory != 'boolean')
                            dir[key].__isdirectory = true;
                        if (dir[key].__isdirectory) {
                            if (!root[key])
                                root[key] = (0, path_type_1.create_path_dict)();
                        }
                        else {
                            if (!root[key])
                                root[key] = (0, path_type_1.create_file_dict)();
                        }
                        root[key].__type = 'file';
                        roots.push({ dir: dir[key], root: root[key] });
                    }
                    else if (!['__access', '__dir', '__allow', '__disallow', '__isdirectory'].includes(key))
                        throw (`[error parse setting ${key} 유효X`);
                }
            }
        }
        // console.log('[parse_setting_json] this.path_dict>',this.path_dict)
    }
    parse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(req.url ? req.url : '', `http://${req.headers.host}`);
            const pathname = decodeURI(url.pathname);
            //길이가 이상하거나, 하는 등 유효겅 검사 코드 추가 필요
            // 인증 관련 처리 -> 모듈화할것
            let auth = true;
            if (this.assess == 'digest') {
                auth = yield this.digest.server(req, res);
                if (!auth)
                    return { type: 'none', todo: '' };
            }
            const access = auth ? 'all' : '';
            const path_arr = (0, sort_functions_1.parse_pathname)(pathname).split('/');
            if (path_arr.some(v => v.startsWith('__')))
                throw ('400 폴더 중 __으로 시작하는게 있음');
            const file_name = path_arr.pop();
            if (file_name == undefined)
                throw ('400 [application_path] does not file_name exist');
            let root = this.path_dict;
            let filepath = (0, sort_functions_1.parse_pathname)(this.path_dict.__dir ? this.path_dict.__dir : ''); //파일이 저장된 위치
            let notdirin = false;
            let type = this.path_dict.__type;
            for (const dir of path_arr) {
                console.log('[parse] for(const dir of path_arr)', { dir, filepath, notdirin, type, path_arr });
                if (notdirin) {
                    filepath += '/' + dir;
                    continue;
                }
                if (dir.startsWith('__'))
                    throw ('400 잘못된 경로입니다');
                if (root.__disallow.map(v => RegExp(`^${(0, sort_functions_1.parse_pathname)(v).replace(/\*/gi, '(.*)')}$`)).some(v => v.test(dir)))
                    throw ('404 [error] 존재하지 않는 접근' + dir + root.__disallow);
                if (root.__allow.includes(access))
                    throw ('403 [errror] 접근 권한이 없습니다.');
                if (root[dir]) {
                    const tmp = root[dir];
                    if (!tmp.__isdirectory)
                        throw ('404 해당 경로는 폴더가 아님');
                    else {
                        if (tmp.__dir) {
                            if (tmp.__dir.startsWith('/'))
                                filepath = tmp.__dir;
                            else
                                filepath = filepath + '/' + (0, sort_functions_1.parse_pathname)(tmp.__dir); //remove_high_dir(
                        }
                        else
                            filepath += '/' + dir;
                        if (tmp.__type)
                            type = tmp.__type;
                    }
                    root = tmp;
                }
                else {
                    if (root.__allow.map(v => RegExp(`^${(0, sort_functions_1.parse_pathname)(v).replace(/\*/gi, '(.*)')}$`)).some(v => v.test(dir))) {
                        notdirin = true;
                        filepath += '/' + dir;
                    }
                }
            }
            // console.log('[pause] dir',{file_name, filepath, notdirin,type})
            // 파일 관련
            if (file_name.startsWith('__'))
                throw ('400 잘못된 경로입니다');
            if (root.__disallow.map(v => RegExp(`^${(0, sort_functions_1.parse_pathname)(v).replace(/\*/gi, '(.*)')}$`)).some(v => v.test(file_name)))
                throw ('404 [error] 존재하지 않는 접근' + file_name + root.__disallow);
            if (root[file_name]) {
                const tmp = root[file_name];
                if (tmp.__isdirectory)
                    throw ('404 해당 경로에 파일이 없음1');
                else {
                    if (tmp.__dir) {
                        if (tmp.__dir.startsWith('/'))
                            filepath = tmp.__dir;
                        else
                            filepath += '/' + (0, sort_functions_1.parse_pathname)(tmp.__dir);
                    }
                    else
                        filepath += '/' + (0, sort_functions_1.parse_pathname)(file_name);
                    if (tmp.__type)
                        type = tmp.__type;
                }
            }
            else if (root.__allow.map(v => RegExp(`^${(0, sort_functions_1.parse_pathname)(v).replace(/\*/gi, '(.*)')}$`)).some(v => v.test(file_name))) {
                notdirin = true;
            }
            else
                throw ('404 해당 경로에 파일이 없음3');
            if (notdirin)
                filepath += '/' + file_name;
            if (!type)
                throw ('404 error: type 없음');
            console.log('[parse] {type:type, todo:filepath}', { type: type, todo: filepath });
            return { type: type, todo: filepath };
            //
            // throw new Error('불가능한 경로 요청됨')
        });
    }
    logging() {
    }
}
exports.default = Path;
/*
path_dict 구성하기

찾기좋게
{
    disallow: 목록...
    allow: 목록:....
    allow 규칙을 먼저 적용한다.
    목록에 없는 파일은 허용하지 않는다.
    그리고 disallow 적용하기
}

*/ 
