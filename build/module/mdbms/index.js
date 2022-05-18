"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MBDMS = void 0;
const mdbms_1 = require("./mdbms");
exports.MBDMS = mdbms_1.MBDMS;
const mBDMS = new exports.MBDMS({ db1: { __type: "sqlite3", __path: undefined, __dir: undefined, students: {
            __access: ['all', 'all', 'all', 'all'],
            name: {
                __type: "string",
                __primarykey: false,
                __notnull: true,
                __access: ['all', 'all', 'all', 'all'], //읽고, 추가. 수정. 삭제.
            }, date: {
                __type: "INTEGER",
                __primarykey: true,
                __autoincrement: true,
                __notnull: true,
            }
        } } });
// for test
//mBDMS.post('db1','students',{'name':'ftjl'},undefined) // 추가
//mBDMS.get('db1','students',['name'],undefined) // 데이터 읽기
// mBDMS.get()
