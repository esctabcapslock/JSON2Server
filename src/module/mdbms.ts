import {IncomingMessage,ServerResponse } from 'http'
// import * as sqlite3 from 'sqlite3'
import {sqlite3,Database} from 'sqlite3'
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

    public async parsehttp(res:ServerResponse,method:string,file:string,table:string,attribute:string|{[key:string]:string}, option:any|undefined){
        const _method = method.toLocaleLowerCase()
        let data
        if(_method=='get') data = this.get(file,table,attribute as string,option)
        else if(_method=='post') data = this.post(file,table,attribute  as {[key:string]:string},option)
        else if(_method=='put') data = this.put(file,table,attribute  as string,option)
        else if(_method=='delete') data = this.delete(file,table,attribute  as string,option)
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
    // public post(file:string,table:string,attribute:string, option:any|undefined){
    public async post(file:string,table:string,attribute:{[key:string]:string|number}, option:any|undefined){
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
                        if(!['__primarykey','__autoincrement','__notnull','__access','__type','__unique','__default','__check','__foreignkey'].includes(key_attribute)) throw('[parsesetting], key_attribute key없음 '+key_attribute)
                        else continue
                    }
                    const _attribute = _talbe[key_attribute] as dbattribute
                    if (typeof _attribute != 'object') throw('[parsesetting _attribute] 잘못된 객체'+key_attribute+_attribute);
                    if (typeof _attribute.__name != 'string')  _attribute.__name = key_attribute// throw('[parsesetting _attribute.__name] 잘못된 값');
                    if(!check___access(_attribute.__access) && _attribute.__access!=undefined) throw('[parsesetting check___access] 잘못된 객체'+_attribute.__access);
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
    public async post(table:string,attribute:{[key:string]:string|number}, option:any|undefined){

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
    private db:Database
    constructor(key:string, path:string,dir:string,file:dbfile){
        if(!file.__dir) file.__dir=key+'.sqlite' //확장자 붙히기 위해
        super(key,path, dir,file)
        this.sqlite3 = require('sqlite3').verbose();
        this.db = new this.sqlite3.Database(this.__dir)
        
        this.setup()
    }

    private getdb(sql:string,obj:{[key:string]:string|number|Buffer|null}){return new Promise((_resolve,_rejects)=>{
        console.log('[getdb]',sql,obj)
        this.db.all(sql,obj,(err,data)=>{
            if(err) _rejects(err)
            else _resolve(data)
        })
    })}

    protected async setup(){//return new Promise<boolean>((resolve,rejects)=>{
        if(!this.db) return false

        console.log('setting]t his.__dir',this.__dir)
        if(!this.sqlite3) this.sqlite3 = require('sqlite3').verbose();
        
        console.log('setting]t his.__dir2',this.__dir)
        //db.serialize(async () => {
            

            const table_list = await this.getdb("SELECT * FROM sqlite_master WHERE type='table'",{});
            console.log('[table_list],',table_list)
            if(!Array.isArray(table_list)) throw('없움')
            const exist_table_names = table_list.map(v=>v.name).filter(v=>!v.startsWith('sqlite_'))

            for(const $tablename of exist_table_names){
                // console.log('[table_info]',$tablename,)
                const table_info = await this.getdb(`PRAGMA table_info("${this.sqlinjection($tablename)}")`,{} )
                // https://sqlite.org/pragma.html#pragma_table_info
                // The pragma command is specific to SQLite and is not compatible with any other SQL database engine.
                // Specific pragma statements may be removed and others added in future releases of SQLite. There is no guarantee of backwards compatibility. 
                // 대충 다음 버전에서 사라질 수 있다는 뜻. 호환 부족함 
               console.log('[table_info]',$tablename,table_info,)
            }
            for(const tablename in this.file) if(!tablename.startsWith('__')){
                console.log('[this.file[tablename]',tablename,this.file[tablename])
                if(!exist_table_names.includes(tablename)){
                    const _table = this.file[tablename] as dbtable

                    const create_sql_bytable = (tablename:string,table:dbtable) =>{
                        let out = `CREATE TABLE "${this.sqlinjection(tablename)}"(\n`
                        const attribute_sql_list = []
                        for(const attributename in table) if(!attributename.startsWith('__')){
                            console.log('[table[attributename]',attributename,table[attributename])
                            attribute_sql_list.push(create_sql_by_attribute(attributename,table[attributename] as dbattribute))
                        }
                        out += attribute_sql_list.join(',\n') + '\n)'
                        console.log('[create_sql_bytable]',out)
                        return out
                    }

                    const create_sql_by_attribute = (attributename:string,attribute:dbattribute)=>{
                        let out = `"${this.sqlinjection(attributename)}"    ${this.sqlinjection(attribute.__type.toUpperCase())} `
                        const settings = []
                        if(attribute.__primarykey) settings.push('PRIMARY KEY')
                        if(attribute.__autoincrement) settings.push('AUTOINCREMENT')
                        if(attribute.__default) settings.push('DEFAULT '+(
                            typeof attribute.__default == 'number')?attribute.__default:
                            (attribute.__default=='null'||attribute.__default==null)?'null':`"${this.sqlinjection(attribute.__default)}"`)
                        if(attribute.__unique) settings.push('UNIQUE')
                        if(attribute.__notnull) settings.push('NOT NULL')
                        if(attribute.__check) settings.push(`CHECK ${this.sqlinjection(attribute.__check)}`)

                        return out + settings.join(' ')
                    }

                    const createdbout = await this.getdb(create_sql_bytable(tablename,_table),{})
                    console.log('createdb]',createdbout)
                    // CREATE TABLE "mapamp" (
// 	"Field1"	INTEGER NOT NULL DEFAULT 21 PRIMARY KEY AUTOINCREMENT UNIQUE,
// 	"Field2"	TEXT UNIQUE,
// 	FOREIGN KEY("Field1") REFERENCES "mapamp"("Field1") rrre
// );
                }
            }
            //    다음처럼 출력됨
//     cid: 0,
//     name: 'Field1',
//     type: 'INTEGER',
//     notnull: 0,
//     dflt_value: null,
//     pk: 1
//   },
            //
            
            
        //});
        
        // db.close();
        return true
        //resolve(true)
    //}
    }
    //데이터 읽기
    public get(table:string,attribute:string, option:any|undefined){
        // this.setup()
    }
    //데이터 추가
    public async post(table:string,attribute:{[key:string]:string|number|null}, option:any|undefined){
        const _table = this.check_valid_table(table,1)

        let cnt = 0
        const attribute_array = []
        const attribute_dict = {} as {[key:string]:string|number|null}


        for (const attributename in attribute){
            const _attribute = this.check_valid_attribute(_table,1,attributename,attribute[attributename])
            this.check_type_attribute(_attribute.__type, attribute[attributename]) //타입체크
            cnt+=1
            attribute_array.push(attributename)
            attribute_dict[`$${cnt}`] = attribute[attributename]
        }
        const sql = `INSERT INTO ${this.sqlinjection(table)}  (${attribute_array.join(', ')}) VALUES(${(Array(cnt)).fill(0).map((v,i)=>`$${i+1}`).join(',')});`
        const insert_out = await this.getdb(sql,attribute_dict)
        console.log('[insert_out],',insert_out)
        // 그 밖에 notnull 배먹은 키는 sql이 잘 거르겠지??
        // 타입체크하기
        // 접근 가능하면

    
        
    }
    //데이터 수정
    public put(table:string,attribute:string, option:any|undefined){

    }
    //데이터 삭제
    public delete(table:string,attribute:string, option:any|undefined){

    }

    public sqlinjection(str:string){
        // SELECT "INSERT" from "SELECT"이딴거
       if( /\s|"|'|=|\*|\n|\r|\.|\,|\(|\)|\{|\}\[|\]|\||\&|\^|\%|\$|\!/.test(str)) throw('err sql not inval')
        return str
    }
    
    private check_valid_table(table:string,accesstype:number){
        if(table.startsWith('__') ) throw('table __로 시작')
        if( !this.file[table]) throw('table 없어')
        if(typeof this.file[table] != 'object') throw('this.file[table] 객체아님')
        const _table = this.file[table] as dbtable
        if(!_table.__access || _table.__access[accesstype] != 'all') throw('권한 없음 '+_table)
        return _table
    }
    private check_valid_attribute(_table:dbtable,accesstype:number,attributename:string,value:any){
        if(attributename.startsWith('__')) throw('attributename __로 시작'+attributename)
        if(!_table[attributename]) throw('attributename __로 시작'+attributename)
        if(typeof _table[attributename] != 'object') throw('_table[attributename] 객체아님'+attributename)
        const _attribute = _table[attributename]  as dbattribute

        //권한체크
        if(_attribute.__access[1] != 'all') throw('권한 없음')

        //notnull 체크
        if(value==null && _attribute.__notnull) throw('notnull error'+attributename)
        
        // __autoincrement 체크
        if( _attribute.__autoincrement) throw('__autoincrement error'+attributename)

        //filiter체크
        if(_attribute.__filiter) if(!_attribute.__filiter.test(String(value))) throw('_attribute.__filiter 만족 x '+_attribute.__filiter)
        return _attribute
    }
    private check_type_attribute(type:string,value:any){
        if (type == 'INTEGER') {if(!Number.isInteger(value)&&value!=null) throw('type error INTEGER '+value+', '+type)}
        else if (type == 'TEXT') {if(!['string','null'].includes(typeof value)) throw('type error string '+value+', '+type)}
        else if (type == 'BLOB') {if(!['buffer','null'].includes(typeof value)) throw('type error buffer '+value+', '+type)}
        else if (type == 'REAL') {if(!['number','null'].includes(typeof value)) throw('type error number '+value+', '+type)}
        // if (_attribute.__type.toUpperCase() == 'NUMERIC') if(!['number','null'].includes(typeof attribute[attributename])) throw('type error INTEGER'+attributename)
    }
    
}

const mBDMS = new MBDMS({db1:{__type:"sqlite3",__path:undefined,__dir:undefined,students:{ //테이블 이름
    __access:['all','all','all','all'],//읽고, 추가. 수정. 삭제.
    name:{ //변수 속성
        __type:"string",
        __primarykey:false,
        __notnull:true,
        __access:['all','all','all','all'],//읽고, 추가. 수정. 삭제.
    },date:{
        __type:"INTEGER",
        __primarykey:true,
        __autoincrement:true,
        __notnull:true,
    }
}}})
mBDMS.post('db1','students',{'name':'ftjl'},undefined) // 추가
mBDMS.get('db1','students','krr',{order:'min'}) // 데이터 읽기
// mBDMS.get()