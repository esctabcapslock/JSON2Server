
export type path_dict = {
    __allow:string[];
    __disallow:string[];
    __isdirectory:boolean;
    __access:string|undefined;
    __dir:string|undefined;
    __type:string|undefined;
    [key:string]:string|path_dict|file_dict|string[]|boolean|undefined;
}
export type file_dict = {
    __isdirectory:boolean;
    __access:string|undefined;
    __dir:string|undefined;
    __type:string|undefined;
    [key:string]:string|boolean|undefined;
}
export function create_path_dict():path_dict{
    const out:path_dict = {
        __isdirectory:true,
        __allow:[],
        __disallow:[],
        __type:'file',
        __access:undefined,
        __dir:undefined,
    }
    return out
}
export function create_file_dict():file_dict{
    const out:file_dict = {
        __isdirectory:false,
        __type:'file',
        __access:undefined,
        __dir:undefined,
    }
    return out
}
