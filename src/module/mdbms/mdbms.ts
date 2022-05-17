import {IncomingMessage,ServerResponse } from 'http'
// import * as sqlite3 from 'sqlite3'

import {parse_connect_pathname,createpath} from '../sort_functions'
import {dbsetting,dbfile,dbtable,dbattribute,create_dbfile,create_dbtable,create_dbattribute,getoption,getattribute,sqlallout} from './mdbms_type'

import {MDBMS_DB} from './mdbms_db'
import {MDBMS_SQLite} from './mdbms_sqlite'

export class MBDMS{//Management System for DataBase Management System
    
    // public __type:string;
    public __path:string;
    public __dir:string;
    private dbmses:{[key:string]:MDBMS_DB};
    
    constructor(setting:{[key:string]:any}){//as dbfile
        const __path = (setting.__path?setting.__path:'db')
        const __dir = (setting.__dir?setting.__dir:'db')
        this.__path = __path
        this.__dir = __dir
        this.dbmses = {}
        createpath(this.__dir)
        

        for (const key in setting){
            if (key.startsWith('__')){
                if(!['__path','__dir'].includes(key)) throw('[parsesetting], key없음 '+key)
                else continue
            }
            const file = setting[key] as dbfile
            if(typeof file.__type != 'string') throw('[__tpye string 아님') 
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

    public async parsehttp(res:ServerResponse,method:string,file:string,table:string,attribute:string|string[]|{[key:string]:string}, option:any|undefined|getoption){
        const _method = method.toLocaleLowerCase()
        let data
        if(_method=='get') data = this.get(file,table,attribute as string[],option as getoption|undefined)
        else if(_method=='post') data = this.post(file,table,attribute  as {[key:string]:string},option)
        else if(_method=='put') data = this.put(file,table,attribute  as string,option)
        else if(_method=='delete') data = this.delete(file,table,attribute  as string,option)
        else throw('[err] parsehttp'+_method)
 
        res.writeHead(200,{'Content-Type':'text/json;charset=utf-8'})
        res.end(data!=undefined?JSON.stringify(data):'{}')
        
    }
    
    public get(file:string,table:string,attribute:string[], option:getoption|undefined){
        // this.setup()
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].get(table,attribute,option)
    }
    //데이터 추가
    // public post(file:string,table:string,attribute:string, option:any|undefined){
    public async post(file:string,table:string,attribute:getattribute, option:any|undefined){
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].post(table,attribute,option)
    }
    //데이터 수정
    public put(file:string,table:string,attribute:string, option:any|undefined){
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].put(table,attribute,option)
    }
    //데이터 삭제
    public delete(file:string,table:string,attribute:string, option:any|undefined){
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].delete(table,attribute,option)
    }

     
}


