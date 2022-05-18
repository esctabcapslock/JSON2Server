/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
import { path_dict } from './path_type';
export default class Path {
    path_dict: path_dict;
    assess: null | string;
    user_list: {
        user_agent: string;
        cookies: string;
        settime: number;
    }[];
    constructor();
    private application_path;
    parse_setting_json(setting: {
        [key: string]: any;
    }): void;
    parse(req: IncomingMessage, res: ServerResponse): Promise<{
        type: string;
        todo: string | {
            [key: string]: any | string;
        };
    }>;
    logging(): void;
}
