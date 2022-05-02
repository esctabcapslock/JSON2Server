export type dbsetting = {__path:string|undefined,__dir:string|undefined,[key:string]:string|dbfile|undefined}
export type dbfile = {__type:string,__path:string|undefined,__dir:string|undefined,[key:string]:dbtable|string|undefined}
export type dbtable = {__name:string,__access:string[4],[key:string]:dbattribute|string|string[4]}
export type dbattribute = {__name:string,__access:string[4],__type:string,__promarykey:boolean,__autucount:boolean,__notnull:boolean,}



// export function create_dbsetting():dbsetting{
//     const out:dbsetting = {
//         __type:type,
//         __path:'/db',
//         __dir:'/db',
//     }
//     return out
// }
export function create_dbfile(type:string,path:string, dir:string):dbfile{
    const out:dbfile = {
        __type:type,
        __path:path,
        __dir:dir,
    }
    return out
}
export function create_dbtable(name:string,access:string[4]):dbtable{
    const out:dbtable = {
        __name:name,
        __access:access
    }
    return out
}
export function create_dbattribute(name:string,access:string[4],type:string,promarykey:boolean|undefined,autucount:boolean|undefined,notnull:boolean|undefined):dbattribute{
    function inbBoolean(key:boolean|undefined){
        if (typeof key != "boolean") return true
        else return false
    }
    const out:dbattribute = {
        __name:name,
        __access:access,
        __type:type,
        __promarykey:Boolean(promarykey),
        __autucount:Boolean(autucount),
        __notnull:inbBoolean(notnull),
    }
    return out
}