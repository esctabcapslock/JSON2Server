type accesstype = [string, string,string,string]
export type dbsetting = {
    __path:string|undefined,__dir:string|undefined,
    [key:string]:string|dbfile|undefined
}
export type dbfile = {__type:string,__path:string|undefined,__dir:string|undefined,__crossorigin:string|undefined,[key:string]:dbtable|string|undefined}
export type dbtable = {__name:string,__access:accesstype,[key:string]:dbattribute|string|accesstype}
export type dbattribute = {
    __name:string,
    __access:accesstype,
    __type:string,
    __primarykey:boolean,
    __autoincrement:boolean,
    __notnull:boolean,
    __unique:boolean,
    __default:any,
    __check:string|undefined,
    __foreignkey:string|undefined,
    __filiter:RegExp|undefined
}



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
        __crossorigin:undefined
    }
    return out
}
export function create_dbtable(name:string,access:accesstype):dbtable{
    const out:dbtable = {
        __name:name,
        __access:access
    }
    return out
}
export function create_dbattribute(option:dbattribute):dbattribute{
    // FOREIGN KEY 뭐야 그동안 노가다했어 - 아 써도 노가다는 해야함
    // name:string,access:string[4],type:string,promarykey:boolean|undefined,autucount:boolean|undefined,notnull:boolean|undefined,unique:boolean|undefined,_default:any,check:string|undefined,foreignkey:string|undefined
    // 이렇게 설정하는 이유는 boolean에 대해 이상한 값이 들어가는지 체크.
    //__foreignkey의 무결성도 체크해야 할 터인데 귀찮네
    function inbBoolean(key:boolean|undefined){
        if (typeof key != "boolean") return true
        else return false
    }
    if(option.__autoincrement){
        if(option.__type.toUpperCase()!='INTEGER')  throw('__type이 정수 아니면 '+option.__type+'option.__autoincrement false')
        if(!option.__primarykey)  throw('option.__autoincrement true면 __primarykey must be true')

    }
    //사용자 지정 타입은 허용X
    // https://www.sqlite.org/datatype3.html
    let __type = option.__type.toUpperCase()
    const ColumnAffinity = {
        'INT':"INTEGER",
        'CHAR':"TEXT",
        'STRING':"TEXT",
        'CLOB':"TEXT",
        'FLOA':"REAL",
        'FLOAT':"REAL",
        'DOUB':"REAL",
        'DOUBLE':"REAL",
        'DATE':"NUMERIC",
        'DATETIME':"NUMERIC"} as {[key:string]:string}
    if(__type in ColumnAffinity)  __type = ColumnAffinity[__type]
    if(!['NULL','INTEGER','REAL','TEXT','BLOB','NUMERIC'].includes(__type)) throw('option.__type not '+__type)

    //filiter
    if(option.__filiter!=undefined &&!(option.__filiter instanceof RegExp))  option.__filiter = RegExp(option.__filiter)
    if(__type =='BLOB') option.__filiter = undefined

    const out:dbattribute = {
        __name:option.__name,
        __access:option.__access?option.__access:['all','all','all','all'],
        __type:__type,
        __primarykey:Boolean(option.__primarykey),
        __autoincrement:Boolean(option.__autoincrement),
        __notnull:Boolean(option.__notnull),
        __unique:Boolean(option.__unique),
        __default:option.__default,
        __check:option.__check,
        __foreignkey:option.__foreignkey,
        __filiter:option.__filiter
    }
    return out
}