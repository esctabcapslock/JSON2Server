export declare const setting: {
    files: {
        __dir: string;
        __allow: string[];
        __disallow: string[];
        __access: string;
        static: {
            js: {
                __dir: string;
                __allow: string[];
            };
        };
        img: {
            __allow: string[];
        };
        "": {
            __isdirectory: boolean;
            __dir: string;
        };
    };
    api: {
        map: {
            __path: string;
            __run: string;
            __argv: string;
        };
    };
    db: {
        __type: string;
        __path: string;
    };
    firetype: {
        mapval: {
            name: string;
            id: string;
        };
        mynumber: {
            __type: string;
            __max: number;
        };
    };
    logging: {
        __path: string;
    };
    access: {
        __type: string;
        __list: {
            user: string;
            admin: string;
        };
    };
    port: number;
};
