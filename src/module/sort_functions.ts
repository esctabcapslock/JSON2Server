import { existsSync, mkdirSync } from "fs";

export function parse_pathname(path:string){
    return path.replace(/\\/gi,'/').replace(/^(\.?)\//,'').replace(/\/$/,'')
}

export function parse_connect_pathname(lpath:string,rpath:string){//결로를 합친다.
    if (rpath.startsWith('/')) return '/'+parse_pathname(rpath);
    else return  lpath+'/'+parse_pathname(rpath); 
}


//path.ts의 함수
// function parse_pathname(path:string){
//     return path.replace(/^(\.?)\//,'').replace(/\/$/,'')
// }

export function remove_high_dir(path:string){
    const ar = parse_pathname(path).split('/')
    ar.pop()
    return ar.join('/');
}


export function is_string_array(obj:any){
    if(!Array.isArray(obj)) return false
    return obj.every(v=>typeof v=='string')
}


export async function createpath(path:string){
    const ar = parse_pathname(path).split('/')
    ar.pop()
    let d = ''
    for (const dir of ar){
        d += dir
        if(!d) continue
        console.log('createpath]',d)
        if(!existsSync(d))
             mkdirSync(d)
    }

}

export function array_value_equal(arr1:any[], arr2:any[]){
    return arr1.every(v=>arr2.includes(v)) && arr2.every(v=>arr1.includes(v))
}
export function check_string_array(arr:any[]):string[]{
    if (!arr.every(v=>typeof v == 'string'))  throw('error not string[]')
    else return arr
    
}
