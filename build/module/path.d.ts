/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { Digest } from "../tool/digest";
declare type path_dict = {
    __allow: string[];
    __disallow: string[];
    __isdirectory: boolean;
    __access: string | undefined;
    __dir: string | undefined;
    __type: string | undefined;
    [key: string]: string | path_dict | file_dict | string[] | boolean | undefined;
};
declare type file_dict = {
    __isdirectory: boolean;
    __access: string | undefined;
    __dir: string | undefined;
    __type: string | undefined;
    [key: string]: string | boolean | undefined;
};
export default class Path {
    path_dict: path_dict;
    digest: Digest;
    assess: null | string;
    constructor();
    private application_path;
    parse_setting_json(setting: {
        [key: string]: any;
    }): void;
    parse(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<{
        type: string;
        todo: string;
    }>;
    logging(): void;
}
export {};
