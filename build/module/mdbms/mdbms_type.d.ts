/// <reference types="node" />
declare type accesstype = [string, string, string, string];
export declare type dbsetting = {
    __path: string | undefined;
    __dir: string | undefined;
    [key: string]: string | dbfile | undefined;
};
export declare type dbfile = {
    __type: string;
    __path: string | undefined;
    __dir: string | undefined;
    __crossorigin: string | undefined;
    __quarylimit: number | undefined;
    [key: string]: dbtable | string | undefined | number;
};
export declare type dbtable = {
    __name: string;
    __access: accesstype;
    [key: string]: dbattribute | string | accesstype;
};
export declare type dbattribute = {
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
export declare type getoption = {
    join: undefined | getjoin;
    as: getas | undefined;
    limit: undefined | number;
    order: undefined | getorder;
};
export declare type getjoin = {
    [key: string]: [string, string];
};
export declare type getas = {
    [key: string]: string;
};
export declare type getorder = {
    column: string;
    order: "ASC" | "DESC";
};
export declare type getattribute = {
    [key: string]: string | number | Buffer;
};
export declare type sqlallout = {
    [key: string]: string | null | number;
}[];
export declare function create_dbfile(type: string, path: string, dir: string, limit: number | undefined): dbfile;
export declare function create_dbtable(name: string, access: accesstype): dbtable;
export declare function create_dbattribute(option: dbattribute): dbattribute;
export declare function get_attribute_from_table(_table: dbtable, attributekey: string): dbattribute;
export declare function check_getattribute(obj: any): getattribute;
export declare function check_getoption(obj: any): getoption;
export {};
