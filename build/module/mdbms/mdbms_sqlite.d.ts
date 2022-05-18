import { MDBMS_DB } from './mdbms_db';
import { dbfile, getoption, getattribute, sqlallout } from './mdbms_type';
export declare class MDBMS_SQLite extends MDBMS_DB {
    private sqlite3;
    private db;
    constructor(key: string, path: string, dir: string, file: dbfile);
    private getdb;
    protected setup(): Promise<boolean>;
    get(table: string, attribute: string[], option?: getoption | null): Promise<sqlallout>;
    post(table: string, attribute: getattribute, option?: null): Promise<void>;
    put(table: string, attribute: getattribute, where: getattribute, option?: null): Promise<void>;
    delete(table: string, where: getattribute, option?: null): Promise<void>;
    sqlinjection(str: string): string;
    private check_valid_table;
    private check_modifiable_attribute;
    private check_accessible_attribute;
    private check_accessible_attribute_with_dot;
    private check_type_attribute;
    private is_unique_attribute;
    private check_getattribute;
    private check_getattribute_where;
}
