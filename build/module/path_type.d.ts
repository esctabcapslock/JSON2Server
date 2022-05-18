export declare type path_dict = {
    __allow: string[];
    __disallow: string[];
    __isdirectory: boolean;
    __access: string | undefined;
    __dir: string | undefined;
    __type: string | undefined;
    [key: string]: string | path_dict | file_dict | string[] | boolean | undefined;
};
export declare type file_dict = {
    __isdirectory: boolean;
    __access: string | undefined;
    __dir: string | undefined;
    __type: string | undefined;
    [key: string]: string | boolean | undefined;
};
export declare function create_path_dict(): path_dict;
export declare function create_file_dict(): file_dict;
