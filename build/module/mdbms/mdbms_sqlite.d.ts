import { MDBMS_DB } from './mdbms_db';
import { Getoption, Getattribute, sqlallout } from './mdbms_type';
export declare class MDBMS_SQLite extends MDBMS_DB {
    private sqlite3;
    private db;
    constructor(key: string, path: string, dir: string, file: {
        [key: string]: any;
    });
    private getdb;
    protected setup(): Promise<boolean>;
    get(table: string, attribute: string[], where?: Getattribute | null, option?: Getoption | null): Promise<sqlallout>;
    post(table: string, attribute: Getattribute, option?: null): Promise<void>;
    put(table: string, attribute: Getattribute, where: Getattribute, option?: null): Promise<void>;
    delete(table: string, where: Getattribute, option?: null): Promise<void>;
    sqlinjection(str: string): string;
    private check_type_attribute;
}
