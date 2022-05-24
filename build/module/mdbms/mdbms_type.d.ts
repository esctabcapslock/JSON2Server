/// <reference types="node" />
export declare type stringobj = {
    [key: string]: any;
};
declare type accesstype = [string, string, string, string];
export declare type sqlallout = {
    [key: string]: string | null | number;
}[];
export declare class Dbfile {
    path: string | undefined;
    dir: string | undefined;
    type: string;
    crossorigin: string | undefined;
    quarylimit: number | undefined;
    data: {
        [key: string]: Dbtable;
    };
    constructor(type: string, path: string, dir: string, limit: number | undefined);
    tablestring2table(table: string): Dbtable;
    check_accessible_getoption(table: string, option: Getoption, keycheckfn: (arg0: string) => string): void;
    check_accessible_attribute_with_dot(_table: string, _attribute: string, keycheckfn: (arg0: string) => string): boolean | undefined;
}
export declare class Dbtable {
    name: string;
    access: accesstype;
    data: {
        [key: string]: Dbattribute;
    };
    constructor(name: string, access: accesstype);
    get_attribute(attributekey: string): Dbattribute;
    is_unique_attribute(attribute: string[]): boolean;
    check_valid_table(accesstype: number): this;
    check_modifiable_attribute(accesstype: number, attributename: string, value: any): Dbattribute;
    check_accessible_attribute(accesstype: number, attributename: string): Dbattribute;
    check_getattribute(attribute: Getattribute, keycheckfn: (arg0: string) => string, typecheckfn: (arg0: string, arg1: any) => boolean): [string[], stringobj];
    check_getattribute_where(attribute: Getattribute, unique: boolean, keycheckfn: (arg0: string) => string, typecheckfn: (arg0: string, arg1: any) => boolean): [string[], stringobj];
}
declare type dbattribute = {
    __name: string;
    __access: accesstype;
    __type: string;
    __primarykey: boolean;
    __autoincrement: boolean;
    __notnull: boolean;
    __unique: boolean;
    __default: any;
    __check: string | undefined;
    __foreignkey: string | undefined;
    __filiter: RegExp | undefined;
};
export declare class Dbattribute {
    name: string;
    access: accesstype;
    type: string;
    primarykey: boolean;
    autoincrement: boolean;
    notnull: boolean;
    unique: boolean;
    default: any;
    check: string | undefined;
    foreignkey: string | undefined;
    filiter: RegExp | undefined;
    constructor(option: dbattribute);
}
export declare class Getattribute {
    private dict;
    constructor(obj: any);
    get(key: string): string | number | Buffer;
    getlist(): string[];
}
export declare class Getoption {
    join: undefined | Getjoin;
    as: Getas | undefined;
    limit: undefined | number;
    order: undefined | Getorder;
    constructor(obj: {
        [key: string]: any;
    });
}
export declare class Getjoin {
    private __data;
    constructor(dict: {
        [key: string]: [string, string];
    });
    get(key: string): [string, string];
    getlist(): string[];
    set(key: string, data: [string, string]): void;
}
export declare class Getas {
    private __data;
    constructor(dict: {
        [key: string]: string;
    });
    get(key: string): string;
    getlist(): string[];
    set(key: string, data: string): void;
}
export declare class Getorder {
    column: string;
    order: "ASC" | "DESC";
    constructor(column: string, order: "ASC" | "DESC");
}
export {};
