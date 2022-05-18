/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { getoption, getattribute } from './mdbms_type';
export declare class MBDMS {
    __path: string;
    __dir: string;
    private dbmses;
    constructor(setting: {
        [key: string]: any;
    });
    is_db_url(url: URL, _method: string): false | string;
    parsehttp(req: IncomingMessage, res: ServerResponse, url: URL, method: string): Promise<boolean>;
    parsedohttp(res: ServerResponse, method: string, file: string | null, table: string | null, attribute: getattribute | null, where: getattribute | null | string[], option: null | getoption): Promise<void>;
    get(file: string, table: string, attribute: string[], option?: getoption | null): Promise<import("./mdbms_type").sqlallout>;
    post(file: string, table: string, attribute: getattribute, option?: null): Promise<void>;
    put(file: string, table: string, attribute: getattribute, where: getattribute, option?: null): Promise<void>;
    delete(file: string, table: string, where: getattribute, option?: null): Promise<void>;
}
