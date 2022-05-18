// import { Module } from "module"

module.exports = setting = {
    files:{
        __dir:"./public/",
        __allow:["./index.html","./*.gif"],
        __disallow:["./real"],
        __access:"all",
        static:{
            js:{
                __dir:"./js",
                __allow:["*"]
                // path / dir을를 새로 설정하지 않으면 유지
                // 아무 말 없으면, 그 폴더 내 파일만 공개됨
                // 하위 파일: 기본적으로 disallow - __allow 규칙 - dissallow 규칙 순차 적용
                // 하위 폴더: 기본적으로 목롥 존재 여부로 allow - __allow 규칙 - disallow 규칙 순차 적용
                // 303 리다이렉트도 나중에 todo

                // localhost/aa/bb/cc에서 다음을 실행
                // <p><a href="./123">123</a><a href="456">456</a><a href="/789">789</a></p>
                // 각각 localhost/aa/bb/123, localhost/aa/bb/456, localhost/789 설정!

            }
        },
        img:{
            __allow:['*.jpg','*.jpeg','*.png']
        },
        "":{
            __isdirectory:false,
            __dir:'index.html'
        }
    },
    api:{
        // restAPT를 지원해야 할 것.
        map:{
            __path:"map",
            __run:"api/map",
            __argv:"mapval"
        }

    },db:{
        // db 읽고 쓰는건 자동으로. 파일 스팸차단 이런건 여기 달 수 있게끔
        __path:"./db",
        db1:{ //파일 이름 1
            __type:"SQLite",
            students:{ //테이블 이름
                __access:['all','all','all','all'],//읽고, 추가. 수정. 삭제.
                name:{ //변수 속성
                    __type:"string",
                    __primarykey:false,
                    __autoincrement:false,
                    __notnull:true,
                    __access:['all','all','all','all'],//읽고, 추가. 수정. 삭제.
                },date:{
                    __type:"INTEGER",
                    __primarykey:true,
                    __autoincrement:true,
                    __notnull:true,
                }
            }
            
        },
        db2:{
            __type:"SQLite",
        }
    },firetype:{ //파일 타입 등등
        mapval:{
            name:"string|undfined",
            id:"mynumber"
        },
        mynumber:{
            __type:"number",
            __max:3000
        }

    },
    logging:{
        "__path":"./log.dat"
    },
    access:{
        __type:"digest",
        __list:{
            "user":"",
            "admin":""
        }
    },
    port:80,

}
    
// 맞다 권한
// 권한과 db구성
