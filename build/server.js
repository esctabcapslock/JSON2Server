"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setting = void 0;
exports.setting = {
    files: {
        __dir: "./public/",
        __allow: ["./index.html"],
        __disallow: ["./real"],
        __access: "all",
        static: {
            js: {
                __dir: "./js",
                __allow: ["*"]
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
        "": {
            __isdirectory: false,
            __dir: 'index.html'
        }
    },
    api: {
        // restAPT를 지원해야 할 것.
        map: {
            __path: "map",
            __run: "api/map",
            __argv: "mapval"
        }
    }, db: {
        // db 읽고 쓰는건 자동으로. 파일 스팸차단 이런건 여기 달 수 있게끔
        __type: "SQLite",
        __path: "./db"
    }, firetype: {
        mapval: {
            name: "string|undfined",
            id: "mynumber"
        },
        mynumber: {
            __type: "number",
            __max: 3000
        }
    },
    logging: {
        "__path": "./log.dat"
    },
    access: {
        __type: "cookie",
        __list: {
            "user": "",
            "admin": ""
        }
    },
    port: 80,
};
// 맞다 권한
// 권한과 db구성