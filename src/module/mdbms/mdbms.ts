import {IncomingMessage,ServerResponse } from 'http'
// import * as sqlite3 from 'sqlite3'

import {createpath,parse_pathname,is_string_array} from '../sort_functions'
import {Dbfile,Getoption,getattribute, check_getattribute} from './mdbms_type'

import {MDBMS_DB} from './mdbms_db'
import {MDBMS_SQLite} from './mdbms_sqlite'

export class MBDMS{//Management System for DataBase Management System
    
    // public __type:string;
    public __path:string;
    public __dir:string;
    private dbmses:{[key:string]:MDBMS_DB};
    
    constructor(setting:{[key:string]:any}){//as dbfile
        const __path = parse_pathname(setting.__path?setting.__path:'db')
        const __dir = parse_pathname(setting.__dir?setting.__dir:'db')
        this.__path = __path
        this.__dir = __dir
        this.dbmses = {}
        createpath(this.__dir)
        

        for (const key in setting){
            if (key.startsWith('__')){
                if(!['__path','__dir'].includes(key)) throw('[parsesetting], key없음 '+key)
                else continue
            }
            const file = setting[key]// as dbfile
            if(typeof file.__type != 'string') throw(`[__tpye string 아님, file.__type:${file.__type}, key:${key}`) 
            const __type = file.__type.toLocaleLowerCase()
            if(__type=='sqlite'||__type=='sqlite3'){
                this.dbmses[key] = new MDBMS_SQLite(key,__path,__dir, file)
            
            }else throw('이상한 type')
        }

        // this.settime = setting
        
        
    }
    // public async parsehttp(req:IncomingMessage,res:ServerResponse){
    //     const method = req.method?.toUpperCase()
    //     const url = new URL(req.url?req.url:'', `http://${req.headers.host}`);
    //     const pathname = decodeURI(url.pathname)
    //     const searchParams = url.searchParams
    //     let data;
    //     if (method=='POST') data = await post_parse(req,res)
    //     // RESTful API에 맞도록 설계해보자
    //     // http://localhost/[__dir]/[tablename]/[attribute]?value=[value] 이런식으로 만들까?
    //     // GET(읽기), GET, POST(생성), PUT(수정), DELETE(삭제)
    //     // 예를 들면 음악재생기에서, 곡정보, 엘범정보 읽어서 동시에 가져왔던건? 다시 말해 join을 처리 못하는건 어케하지? 클라이언트에서 처리하면?
    //     // 전송 오버해드가 커질 수(작아질 수도)있고, 클라이언트가 힘들어함;;;, 서버측 코드가 간단하다!
    //     // 내부 API에서도 호출할 수 있게끔 [parse 함수를 서버부분과 db부분으로 나누자.]
    //     // selete문, join을 처리하기 위해 기능을 추가해야함
    //     // orderby는 순서, limit는 가져올 문서 개수
        
    // }

    public is_db_url(url:URL, _method:string):false|string{
        const method = _method.toLocaleUpperCase()
        if(!['GET','POST','PUT','DELETE'].includes(method)) return false
        for (const file in this.dbmses){
            if(this.dbmses[file].getpath == parse_pathname(url.pathname)) return file
        }
        return false

    }
    public async parsehttp(req:IncomingMessage,res:ServerResponse, url:URL, method:string){return new Promise<boolean>(async (resolve,rejects)=>{
        method = method.toLocaleUpperCase()
        const file_name = this.is_db_url(url,method)
        if(!file_name) {resolve(false); return}

        const JSON_parse = (x:string|null) => {
            if(x==null) return null
            else try{return JSON.parse(x)}catch(e){rejects(`e:${e}, x:${x}`)}
        }
        console.log(url)
        if (url.search){
            try{
            await this.parsedohttp(
                res,method,
                file_name,
                url.searchParams.get('table'),
                JSON_parse(url.searchParams.get('attribute')),
                JSON_parse(url.searchParams.get('where')),
                JSON_parse(url.searchParams.get('option'))
                )
                resolve(true)
            }catch(e) {rejects(`404 응답 get json 형태 X ${e}`)}
        }else{
            const data:Buffer[] = []
            // try{
            // req.res
                req.on('data', (chunk)=> data.push(Buffer.from(chunk)))
                req.on('end',async()=>{
                    try{
                        const{file_name,table,where,attribute,option} = JSON.parse(Buffer.concat(data).toString())
                        await this.parsedohttp(res,method,file_name,table,attribute,where,option)
                        resolve(true)
                    }catch(e) {rejects(`404 응답 json 형태 X ${e}`)}
                })
                req.on('error',()=>{
                    rejects('error req')
                })
            // }catch(e){rejects(`404 e:${e}`)}
        };
    })}
    public async parsedohttp(res:ServerResponse,method:string,file:string|null,table:string|null,attribute:getattribute|null,where:getattribute|null|string[], option:null|Getoption){
        try{
            let data

            if(!table || typeof table != 'string') throw('400 error table formet')
            if(!file  || typeof file != 'string') throw('400 error table formet')
            switch (method){
                case 'GET':
                    if(!Array.isArray(attribute) || !is_string_array(attribute)) throw('err attribure err')
                    data = await this.get(file,table,attribute, option==null?null:new Getoption(option))
                    break
                case 'POST':
                    data = await this.post(file,table,check_getattribute(attribute))
                    break
                case 'PUT':
                    data = await this.put(file,table,check_getattribute(attribute), check_getattribute(where))
                    break
                case 'DELETE':
                    data = await this.delete(file,table,check_getattribute(where))
                    break
                default:
                    throw('[err] parsehttp '+method)
            }
    
            
            //return {code:200,header:{'Content-Type':'text/json;charset=utf-8'}, data}
            res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'})
            res.end(data!=undefined?JSON.stringify(data):'{}')
        }catch(e) {
            throw(`404 [parsedohttp] e:${e}`)
        }
    }
    
    public get(file:string,table:string,attribute:string[], option:Getoption|null=null){
        // this.setup()
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].get(table,attribute,option)
    }
    //데이터 추가
    // public post(file:string,table:string,attribute:string, option:any|undefined){
    public async post(file:string,table:string,attribute:getattribute, option:null=null){
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].post(table,attribute,option)
    }
    //데이터 수정
    public put(file:string,table:string,attribute:getattribute,where:getattribute, option:null=null){
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].put(table,attribute,where,option)
    }
    //데이터 삭제
    public delete(file:string,table:string,where:getattribute, option:null=null){
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].delete(table,where,option)
    }

     
}


