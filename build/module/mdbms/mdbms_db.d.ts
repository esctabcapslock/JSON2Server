import { Dbfile, Getoption, Getattribute, sqlallout } from './mdbms_type';
export declare class MDBMS_DB {
    protected file: Dbfile;
    protected path: string;
    protected dir: string;
    protected quarylimit: number | undefined;
    get getpath(): string;
    parsesetting(file: {
        [key: string]: any;
    }): this;
    constructor(key: string, path: string, dir: string, file: {
        [key: string]: any;
    });
    protected setup(): Promise<boolean>;
    get(table: string, attribute: string[], where?: Getattribute | null, option?: Getoption | null): Promise<sqlallout>;
    post(table: string, attribute: Getattribute, option?: null): Promise<void>;
    put(table: string, attribute: Getattribute, where: Getattribute, option?: null): Promise<void>;
    delete(table: string, where: Getattribute, option?: null): Promise<void>;
}
