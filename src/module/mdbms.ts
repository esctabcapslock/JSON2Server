import {IncomingMessage,ServerResponse } from 'http'
// import * as sqlite3 from 'sqlite3'
import {sqlite3} from 'sqlite3'
import {parse_connect_pathname,createpath} from './sort_functions'
import {dbsetting,dbfile,dbtable,dbattribute,create_dbfile,create_dbtable,create_dbattribute} from './mdbms_type'

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
                this.dbmses[key] = new DBMS_SQLite(key,__path,__dir, file)
            
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

    public async parsehttp(res:ServerResponse,method:string,file:string,table:string,attribute:string, option:any|undefined){
        const _method = method.toLocaleLowerCase()
        let data
        if(_method=='get') data = this.get(file,table,attribute,option)
        else if(_method=='post') data = this.post(file,table,attribute,option)
        else if(_method=='put') data = this.put(file,table,attribute,option)
        else if(_method=='delete') data = this.delete(file,table,attribute,option)
        else throw('[err] parsehttp'+_method)
 
        res.writeHead(200,{'Content-Type':'text/json;charset=utf-8'})
        res.end(data!=undefined?JSON.stringify(data):'{}')
        
    }
    
    public get(file:string,table:string,attribute:string, option:any|undefined){
        // this.setup()
        if(typeof this.dbmses[file] != 'object') throw('[get] this.dbmses[file] != object')
        return this.dbmses[file].get(table,attribute,option)
    }
    //데이터 추가
    public post(file:string,table:string,attribute:string, option:any|undefined){
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

class MDBMS_DB{
    protected file:dbfile;
    protected __path: string;
    protected __dir: string;
    public parsesetting(file:dbfile){

        function check___access(tmp:any){
            if (!Array.isArray(tmp) || tmp.length!=4 || !tmp.every(v=>(typeof v =='string')))  return false
            else return true
        }

        // this.
        // this.settime = setting
        // this.settime.__path = setting.__path?setting.__path:'/db'
        // this.settime.__dir = setting.__dir?setting.__dir:'/db'
        // for (const  key in setting){
            // if (key.startsWith('__') && !['__type','__path','__dir'].includes(key)) throw('[parsesetting], key없음 '+key)
            // const file = setting[key] as dbfile
            // if (typeof file != 'object') throw('[parsesetting] 잘못된 객체');
            // file.__path = parse_connect_pathname(this.settime.__path,file.__path?file.__path:key)
            // file.__dir = parse_connect_pathname(this.settime.__dir,file.__dir?file.__dir:key)
            // const _cfile = create_dbfile(file.__path,file.__dir)
            // this.settime[key] = _cfile
            const _cfile = this.file
            for(const key_table in file){//__name:string,__access
                if (key_table.startsWith('__')){
                    if(!['__access','__type','__path','__name','__dir'].includes(key_table)) throw('[parsesetting], tablename key없음 '+key_table)
                    else continue
                }
                const _talbe = file[key_table] as dbtable
                if (typeof _talbe != 'object') throw('[parsesetting _talbe] 잘못된 객체'+_talbe);
                if(!check___access(_talbe.__access)) throw('[parsesetting check___access] 잘못된 객체');
                const _ctalbe = create_dbtable(key_table, _talbe.__access)
                _cfile[key_table] = _ctalbe
                for (const key_attribute in _talbe){
                    if (key_attribute.startsWith('__')){
                        if(!['__primarykey','__autoincrement','__notnull'].includes(key_attribute)) throw('[parsesetting], key_attribute key없음 '+key_attribute)
                        else continue
                    }
                    const _attribute = _talbe[key_attribute] as dbattribute
                    if (typeof _attribute != 'object') throw('[parsesetting _attribute] 잘못된 객체');
                    if (typeof _attribute.__name != 'string')  _attribute.__name = key_attribute// throw('[parsesetting _attribute.__name] 잘못된 값');
                    if(!check___access(_attribute.__access)) throw('[parsesetting check___access] 잘못된 객체');
                    if (typeof _attribute.__type != 'string') throw('[parsesetting _attribute.__type] 잘못된 값');
                    _ctalbe[key_attribute] = create_dbattribute(_attribute)
                    // __name:string,__access:string[4],__type
                }
            }
           // tablename
        // }
        return this
    }

    constructor(key:string,path:string,dir:string,file:dbfile){
        if(typeof file.__type != 'string') throw('[__tpye string 아님') 
        if(typeof key != 'string') throw('[__tpye string 아님') 
        const __path = parse_connect_pathname(path,file.__path?file.__path:key)
        const __dir = parse_connect_pathname(dir,file.__dir?file.__dir:key)
        this.__path = __path
        this.__dir = __dir
        this.file = create_dbfile(file.__type,__path,__dir)
        createpath(this.__dir)
        this.parsesetting(file)
        this.setup()
    }

    protected async setup(){
        // 체크하는 부분
        const checked = true
        // 값이 존재하면 사실 하기
        if(checked) return true 

        // DB 설정 코드
        

        return true
    }


    //데이터 읽기
    public get(table:string,attribute:string, option:any|undefined){
        // this.setup()
    }
    //데이터 추가
    public post(table:string,attribute:string, option:any|undefined){

    }
    //데이터 수정
    public put(table:string,attribute:string, option:any|undefined){

    }
    //데이터 삭제
    public delete(table:string,attribute:string, option:any|undefined){

    }
}

class DBMS_SQLite extends MDBMS_DB{
    private sqlite3:sqlite3
    constructor(key:string, path:string,dir:string,file:dbfile){
        if(!file.__dir) file.__dir=key+'.sqlite' //확장자 붙히기 위해
        super(key,path, dir,file)
        this.sqlite3 = require('sqlite3').verbose();
        
        // this.setup()
    }

    protected async setup(){//return new Promise<boolean>((resolve,rejects)=>{
        console.log('setting]t his.__dir',this.__dir)
        if(!this.sqlite3) this.sqlite3 = require('sqlite3').verbose();
        const db = new this.sqlite3.Database(this.__dir)
        console.log('setting]t his.__dir2',this.__dir,db)
        //db.serialize(async () => {
            function getdb(sql:string,obj:{[key:string]:string|number|Buffer}){return new Promise((_resolve,_rejects)=>{
                db.all(sql,obj,(err,data)=>{
                    if(err) _rejects(err)
                    else _resolve(data)
                })
            })}

            const table_list = await getdb("SELECT * FROM sqlite_master WHERE type='table'",{});
            console.log('[table_list],',table_list)
            if(!Array.isArray(table_list)) throw('없움')

            for(const $tablename of table_list.map(v=>v.name).filter(v=>!v.startsWith('sqlite_'))){
                // console.log('[table_info]',$tablename,)
                const table_info = await getdb(`PRAGMA table_info(${this.sqlinjection($tablename)})`,{} )
                // https://sqlite.org/pragma.html#pragma_table_info
                // The pragma command is specific to SQLite and is not compatible with any other SQL database engine.
                // Specific pragma statements may be removed and others added in future releases of SQLite. There is no guarantee of backwards compatibility. 
                // 대충 다음 버전에서 사라질 수 있다는 뜻. 호환 부족함 
               console.log('[table_info]',$tablename,table_info,)
            //    다음처럼 출력됨
//     cid: 0,
//     name: 'Field1',
//     type: 'INTEGER',
//     notnull: 0,
//     dflt_value: null,
//     pk: 1
//   },
            //
            }
            
        //});
        
        db.close();
        return true
        //resolve(true)
    //}
    }
    //데이터 읽기
    public get(table:string,attribute:string, option:any|undefined){
        // this.setup()
    }
    //데이터 추가
    public post(table:string,attribute:string, option:any|undefined){return new Promise((resolve,rejects)=>{
        // const db = new this.sqlite3.Database(this.__dir)
        // db.serialize(()=>{
        //     db.get(`selete * FROM $table `,{table},(err,data)=>{
        //         if(err) throw('ewer');
        //         return data
        //     })
        // })
    })
        
    }
    //데이터 수정
    public put(table:string,attribute:string, option:any|undefined){

    }
    //데이터 삭제
    public delete(table:string,attribute:string, option:any|undefined){

    }

    public sqlinjection(str:string){
        // SELECT "INSERT" from "SELECT"이딴거
       if( /\s|"|'|=|\*/gi.test(str)) throw('err sql not inval')
        return str
    }
    
}

const mBDMS = new MBDMS({db1:{__type:"sqlite3",__path:undefined,__dir:undefined}})
mBDMS.post('db1','students','krr',undefined) // 추가
mBDMS.get('db1','students','krr',{order:'min'}) // 데이터 읽기
// mBDMS.get()