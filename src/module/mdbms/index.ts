import {MBDMS as _MDBMS} from './mdbms' 
export const MBDMS = _MDBMS

const mBDMS = new MBDMS({db1:{__type:"sqlite3",__path:undefined,__dir:undefined,students:{ //테이블 이름
    __access:['all','all','all','all'],//읽고, 추가. 수정. 삭제.
    name:{ //변수 속성
        __type:"string",
        __primarykey:false,
        __notnull:true,
        __access:['all','all','all','all'],//읽고, 추가. 수정. 삭제.
    },date:{
        __type:"INTEGER",
        __primarykey:true,
        __autoincrement:true,
        __notnull:true,
    }
}}})

// for test
//mBDMS.post('db1','students',{'name':'ftjl'},undefined) // 추가
//mBDMS.get('db1','students',['name'],undefined) // 데이터 읽기
// mBDMS.get()
