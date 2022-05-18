import { dbfile, getoption, getattribute, sqlallout } from './mdbms_type';
export declare class MDBMS_DB {
    protected file: dbfile;
    protected __path: string;
    protected __dir: string;
    protected __quarylimit: number | undefined;
    get path(): string;
    parsesetting(file: dbfile): this;
    constructor(key: string, path: string, dir: string, file: dbfile);
    protected setup(): Promise<boolean>;
    get(table: string, attribute: string[], option?: getoption | null): Promise<sqlallout>;
    post(table: string, attribute: getattribute, option?: null): Promise<void>;
    put(table: string, attribute: getattribute, where: getattribute, option?: null): Promise<void>;
    delete(table: string, where: getattribute, option?: null): Promise<void>;
}
