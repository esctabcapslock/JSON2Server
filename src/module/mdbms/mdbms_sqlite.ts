import {sqlite3,Database} from 'sqlite3'
import {MDBMS_DB} from './mdbms_db'
import {dbsetting,dbfile,dbtable,dbattribute,create_dbfile,create_dbtable,create_dbattribute,getoption,getattribute,sqlallout} from './mdbms_type'


export class MDBMS_SQLite extends MDBMS_DB{
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
    public async get(table:string,attribute:string[], option:getoption|undefined){
        // this.setup()
        // option  조건:
        //attribute에 있어야 함.
        if(!option) option = {join:undefined,limit:undefined,as:undefined,order:undefined}
        let sql = `SELETE `
        const field = [] as string[]

        const req_attribute = []
        for (const val of attribute) if (this.check_accessible_attribute(table,1,val)) req_attribute.push(val)




        

        // attribute명
        if(option.as){
            for(const ketas in option.as){

            }

        }//as의 것들이 합당한지 판단

        if(!field.length) throw('길이X')
        sql+=`${field.join(',')} WHERE `

        // whele문 작성


        // 실행
        const insert_out = await this.getdb(sql,{}) as sqlallout
        console.log('[insert_out],',insert_out)
        return insert_out
        // 아마 반환하는거 타입이 {[key:string]:string|null|number}[]일텐데... 확실하지 않네?
    }
    //데이터 추가
    public async post(table:string,attribute:getattribute, option:any|undefined){
        const _table = this.check_valid_table(table,1)

        let cnt = 0
        const attribute_array = []
        const attribute_dict = {} as getattribute


        for (const attributename in attribute){
            const _attribute = this.check_modifiable_attribute(_table,1,attributename,attribute[attributename])
            this.check_type_attribute(_attribute.__type, attribute[attributename]) //타입체크
            cnt+=1
            attribute_array.push(attributename)
            attribute_dict[`$${cnt}`] = attribute[attributename]
        }
        const sql = `INSERT INTO ${this.sqlinjection(table)}  (${attribute_array.join(', ')}) VALUES(${(Array(cnt)).fill(0).map((v,i)=>`$${i+1}`).join(',')});`
        const insert_out = await this.getdb(sql,attribute_dict) as sqlallout
        console.log('[insert_out],',insert_out)
        // 그 밖에 notnull 배먹은 키는 sql이 잘 거르겠지??
        // 타입체크하기
        // 접근 가능하면

    
        
    }
    //데이터 수정
    public async put(table:string,attribute:string, option:any|undefined){

    }
    //데이터 삭제
    public async delete(table:string,attribute:string, option:any|undefined){

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
    private check_modifiable_attribute(_table:dbtable|string,accesstype:number,attributename:string,value:any){
        // 접근할 수 있는지 체크
        const _attribute = this.check_accessible_attribute(_table,accesstype,attributename)

        //notnull 체크
        if(value==null && _attribute.__notnull) throw('notnull error'+attributename)
        
        // __autoincrement 체크
        if( _attribute.__autoincrement) throw('__autoincrement error'+attributename)

        //filiter체크
        if(_attribute.__filiter) if(!_attribute.__filiter.test(String(value))) throw('_attribute.__filiter 만족 x '+_attribute.__filiter)
        return _attribute
    }
    private check_accessible_attribute(_table:dbtable|string, accesstype:number,attributename:string){
        if(typeof _table =='string') _table = this.check_valid_table(_table, accesstype)

        if(attributename.startsWith('__')) throw('attributename __로 시작'+attributename)
        if(!_table[attributename]) throw('attributename __로 시작'+attributename)
        if(typeof _table[attributename] != 'object') throw('_table[attributename] 객체아님'+attributename)
        const _attribute = _table[attributename]  as dbattribute

        //권한체크
        if(_attribute.__access[1] != 'all') throw('권한 없음')
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