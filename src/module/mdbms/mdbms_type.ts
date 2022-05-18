import exp from "constants"
import { is_string_array } from "../sort_functions"

type accesstype = [string, string,string,string]
export type dbsetting = {
    __path:string|undefined,__dir:string|undefined,
    [key:string]:string|dbfile|undefined
}
// this.quary_limit = Number.isInteger(file.quary_limit) ? file.quary_limit as number : 100;
export type dbfile = {__type:string,__path:string|undefined,__dir:string|undefined,__crossorigin:string|undefined,__quarylimit:number|undefined,[key:string]:dbtable|string|undefined|number}
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


// get**** : get 요청시 파일 구조
export type getoption = {join:undefined|getjoin, as:getas|undefined, limit:undefined|number, order:undefined|getorder}

export type getjoin = {[key:string]:[string,string]} //Join {"table1.file1": [table2,field2], … }
export type getas = {[key:string]:string} //Join {"table1.file1": nickname, … }
export type getorder = {column:string,order:"ASC"|"DESC"} //Join {"table1.file1": [table2,field2], … }
export type getattribute = {[key:string]:string|number|Buffer}
export type sqlallout = {[key:string]:string|null|number}[]
// {[key:string]:string|number|null}


// export function create_dbsetting():dbsetting{
//     const out:dbsetting = {
//         __type:type,
//         __path:'/db',
//         __dir:'/db',
//     }
//     return out
// }
export function create_dbfile(type:string,path:string, dir:string, limit:number|undefined):dbfile{
    const out:dbfile = {
        __type:type,
        __path:path,
        __dir:dir,
        __crossorigin:undefined,
        __quarylimit:limit
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
        if(option.__type.toUpperCase()!='INTEGER')  throw(`name:${option.__name} __type이 정수 아니면 ${+option.__type} option.__autoincrement false`)
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
    if(typeof option.__name != 'string') throw('option name is not string')

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

export function get_attribute_from_table(_table:dbtable, attributekey:string){
    if(attributekey.startsWith('__')) throw('attributename __로 시작'+attributekey)
    if(!_table[attributekey]) throw('attributename __로 시작'+attributekey)
    if(typeof _table[attributekey] != 'object') throw('_table[attributename] 객체아님'+attributekey)
    return _table[attributekey]  as dbattribute
}


// export type getoption = {join:undefined|getjoin, as:getas|undefined, limit:undefined|null|number, order:undefined|getorder}

// export type getjoin = {[key:string]:[string,string]} //Join {"table1.file1": [table2,field2], … }
// export type getas = {[key:string]:string} //Join {"table1.file1": nickname, … }
// export type getorder = {column:string,order:"ASC"|"DESC"} //Join {"table1.file1": [table2,field2], … }
// export type getattribute = {[key:string]:string|number}

export function check_getattribute(obj:any):getattribute{
    if (typeof obj !='object') throw('객체가 아님')
    for (const key in obj){
        if(typeof key != 'string') throw('key 문자가 아님')
        if (!['string','number'].includes(typeof obj[key]) && !Buffer.isBuffer(obj[key])) throw('obj[key] 타입 다르다')
    }
    return obj
}

export function check_getoption(obj:any):getoption{
    if (typeof obj !='object') throw('객체가 아님')
    for (const key in obj){
        // if(!['join','as','limit','order'].includes(key)) 
        switch (key){
            case 'join':
                if(typeof obj[key] != 'object' || obj[key] != undefined) throw(`${key} 타입 오류`)
                if(typeof obj[key] == 'object') for(const joinkey in obj[key]){
                    if(typeof joinkey!= 'string') throw(`${key} 타입 오류`)
                    if( !(Array.isArray(obj[key][joinkey]) && is_string_array(obj[key][joinkey]) && obj[key][joinkey].length==2)) throw(`${key} 타입 오류`)
                }
                break
            case 'as':
                if(typeof obj[key] != 'object' || obj[key] != undefined) throw(`${key} 타입 오류`)
                if(typeof obj[key] == 'object') for(const joinkey in obj[key]){
                    if(typeof joinkey!= 'string') throw(`${key} 타입 오류`)
                    if(typeof obj[key][joinkey] != 'string') throw(`${key} 타입 오류`)
                }
                break
            case 'limit':
                if (!(obj[key] == undefined || (Number.isInteger(obj[key]) && obj[key]>=0))) throw(`${key} 타입 오류`)
                break
            case 'order':
                if(typeof obj[key] != 'object' || obj[key] != undefined) throw(`${key} 타입 오류`)
                if(typeof obj[key] == 'object') for(const joinkey in obj[key]){
                    switch (joinkey){
                        case 'column':
                            if(typeof obj[key][joinkey] != 'string') throw(`${key} 타입 오류`)
                            break
                        case 'order':
                            if(!["ASC","DESC"].includes(obj[key][joinkey])) throw(`${key} 타입 오류`)
                            break
                        default:
                            throw(`${key} 타입 오류`)
                    }
                }
                break
            default:
                throw('값 없음, 이상한 키'+key)
        }
    }
    return obj
}