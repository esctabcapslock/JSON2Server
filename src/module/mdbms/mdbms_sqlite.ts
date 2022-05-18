import {sqlite3,Database} from 'sqlite3'
import {MDBMS_DB} from './mdbms_db'
import {dbfile,dbtable,dbattribute,getoption,getattribute,sqlallout,get_attribute_from_table} from './mdbms_type'
import {check_string_array, is_string_array} from '../sort_functions'


export class MDBMS_SQLite extends MDBMS_DB{
    private sqlite3:sqlite3
    private db:Database
    constructor(key:string, path:string,dir:string,file:dbfile){
        if(!file.__dir) file.__dir=key+'.sqlite' //확장자 붙히기 위해
        super(key,path, dir,file)
        this.sqlite3 = require('sqlite3').verbose();
        // this.__dir = '/'+this.__dir
        console.log('[this.__dir] - MDBMS_SQLite',__dirname, this.__dir)
        require('fs').writefile
        this.db = new this.sqlite3.Database(this.__dir)
        
        this.setup()
    }

    private getdb(sql:string,obj:{[key:string]:string|number|Buffer|null}){return new Promise<sqlallout>((_resolve,_rejects)=>{
        console.log('[getdb]',sql,obj)
        this.db.all(sql,obj,(err,data)=>{
            if(err) _rejects(err)
            else _resolve(data as sqlallout)
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
            if(!table_list.every(v=>typeof v.name == 'string')) throw('name이 string 아님')
            const exist_table_names = check_string_array(table_list.map(v=>v.name)).filter(v=>!v.startsWith('sqlite_'))

            for(const $tablename of exist_table_names){
                // console.log('[table_info]',$tablename,)
                const table_info = await this.getdb(`PRAGMA table_info("${this.sqlinjection($tablename)}")`,{} )
                // https://sqlite.org/pragma.html#pragma_table_info
                // The pragma command is specific to SQLite and is not compatible with any other SQL database engine.
                // Specific pragma statements may be removed and others added in future releases of SQLite. There is no guarantee of backwards compatibility. 
                // 대충 다음 버전에서 사라질 수 있다는 뜻. 호환 부족함 
               //console.log('[table_info]',$tablename,table_info,)
            }
            for(const tablename in this.file) if(!tablename.startsWith('__')){
                //console.log('[this.file[tablename]',tablename,this.file[tablename])
                if(!exist_table_names.includes(tablename)){
                    const _table = this.file[tablename] as dbtable

                    const create_sql_bytable = (tablename:string,table:dbtable) =>{
                        let out = `CREATE TABLE "${this.sqlinjection(tablename)}"(\n`
                        const attribute_sql_list = []
                        for(const attributename in table) if(!attributename.startsWith('__')){
                            console.log('[table[attributename]',attributename,table[attributename])
                            attribute_sql_list.push(create_sql_by_attribute(attributename,get_attribute_from_table(table, attributename)))
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
        //});
        
        return true
    }
    //데이터 읽기
    public async get(table:string,attribute:string[], option:getoption|null=null){
        // this.setup()
        // option  조건:
        //attribute에 있어야 함.
        if(!option) option = {join:undefined,limit:undefined,as:undefined,order:undefined}
        let sql = `SELECT`
        // const field:string[] = [] 

        // const req_attribute = []

        // 테이블 가능 확인
        this.check_valid_table(table,1)

        try{
            // 속성을 요청했는지 확인
            if(!is_string_array(attribute) || attribute.length==0) throw(`table:${table} attribute 길이가 0이거나 배열이 아님`)

            // 접근 가능한 속성인지 확인
            for (const val of attribute) this.check_accessible_attribute_with_dot(table,val) //) req_attribute.push(val)
                
            // join의 값들 유효성 확인
            if (option.join) for (const val in option.join) {
                if (!val.includes('')) throw('option join key 유효X 문자')
                this.check_accessible_attribute_with_dot('',val)
                const [tablename, attributename] = option.join[val]
                this.check_valid_table(tablename, 1)
                this.check_accessible_attribute(tablename, 1, attributename)
            }

            //as의 값들 유효성 확인
            if (option.as) for (const val in option.as){
                if (!val.includes('')) throw('option as key 유효X 문자')
                this.check_accessible_attribute_with_dot('',val)
                this.sqlinjection(option.as[val])
            } 

            if (!option.limit && this.__quarylimit) option.limit = this.__quarylimit
            if (Number.isInteger(!option.limit)) throw('limit 잘못됨')

            if(option.order){
                this.check_accessible_attribute_with_dot(table,option.order.column)
                if(!["ASC","DESC"].includes(option.order.order)) throw("opt oredr 잘못됨")
            }

            // option

        }catch(e){
            throw(`400 [sqlite db get] 요청사항의 문제. e:${e}`)
        }

            
        //sql문 생성

        sql += ' ' + attribute.map(v=> {
            if(option?.as && v in option.as) return `${v} AS ${option.as[v]}`  
            else return v
        }).join(',') + ` FROM ${table}`
        if(option.join) for(const val in option.join){

            const [tablename, attributename] = option.join[val];

            sql+=`
            LEFT OUTER JOIN ${tablename} ON
            ${val} = ${tablename}.${attributename}`
        }
        if(option.limit) sql += `\nlimit ${option.limit}`
        if(option.order) sql += `\n ORDER BY ${option.order.column} ${option.order.order}`

        // ORDER BY [attribute] [DESC|ASC|

        // if(!field.length) throw(`길이X field:${field}`)
        // sql+=`${field.join(',')} WHERE `

        // whele문 작성


        // 실행
        const insert_out = await this.getdb(sql,{})
        console.log('[insert_out],',insert_out)
        return insert_out
        // 아마 반환하는거 타입이 {[key:string]:string|null|number}[]일텐데... 확실하지 않네?
    }
    //데이터 추가
    public async post(table:string,attribute:getattribute, option:null=null){
        const _table = this.check_valid_table(table,1)

        const [attribute_array, attribute_dict] = this.check_getattribute(table,attribute)

        // let cnt = 0
        // const attribute_array = []
        // const attribute_dict:getattribute = {}


        // for (const attributename in attribute){
        //     const _attribute = this.check_modifiable_attribute(_table,1,attributename,attribute[attributename])
        //     this.check_type_attribute(_attribute.__type, attribute[attributename]) //타입체크
        //     cnt+=1
        //     attribute_array.push(attributename)
        //     attribute_dict[`$${cnt}`] = attribute[attributename]
        // }
        // const sql = `INSERT INTO ${this.sqlinjection(table)}  (${attribute_array.join(', ')}) VALUES(${(Array(cnt)).fill(0).map((v,i)=>`$${i+1}`).join(',')});`
        const sql = `INSERT INTO ${this.sqlinjection(table)}
                     (${attribute_array.join(', ')}) VALUES(${attribute_array.map(v=>`$`+v).join(',')});`
        const insert_out = await this.getdb(sql,attribute_dict)
        console.log('[insert_out],',insert_out)
        // 그 밖에 notnull 배먹은 키는 sql이 잘 거르겠지??
        // 타입체크하기
        // 접근 가능하면

    
        
    }
    //데이터 수정
    public async put(table:string,attribute:getattribute,where:getattribute, option:null=null){
       
        const [where_array, sql_dict1] = this.check_getattribute_where(table,where)
        const [attribute_array, sql_dict2] = this.check_getattribute(table,attribute)

        // UPDATE table_name
        // SET column1 = value1, column2 = value2, ...
        // WHERE condition; 

        const sql = `UPDATE ${this.sqlinjection(table)}
                     SET ${attribute_array.map(v=>`${v}=$${v}`).join(',')}
                     WHERE ${where_array.map(v=>`${v}=$${v}`).join(' AND ')}` // 등호 1개 맞음
        const insert_out = await this.getdb(sql,{...sql_dict1,...sql_dict2})
        console.log('[insert_out],',insert_out)

    }
    //데이터 삭제
    public async delete(table:string,where:getattribute, option:null=null){
        const [where_array, sql_dict] = this.check_getattribute_where(table,where)

        if(!this.is_unique_attribute(table,where_array)) throw('[delete] error')
        const sql = `DELETE FROM ${this.sqlinjection(table)}
                     WHERE ${where_array.map(v=>`${v}=$${v}`).join(' AND ')}` // 등호 1개 맞음
        const insert_out = await this.getdb(sql,sql_dict)
        console.log('[insert_out],',insert_out)

    }

    public sqlinjection(str:string){
        // SELECT "INSERT" from "SELECT"이딴거
       if( /\s|"|'|=|\*|\n|\r|\.|\,|\(|\)|\{|\}\[|\]|\||\&|\^|\%|\$|\!/.test(str)) throw('[sqlinjection] err sql not inval')
        return str
    }
    
    private check_valid_table(table:string,accesstype:number){
        this.sqlinjection(table)
        if(table.startsWith('__') ) throw('[check_valid_table] table __로 시작')
        if( !this.file[table]) throw(`[check_valid_table] table(${table}) 없어`)
        if(typeof this.file[table] != 'object') throw('this.file[table] 객체아님')
        const _table = this.file[table] as dbtable
        if(!_table.__access || _table.__access[accesstype] != 'all') throw('[check_valid_table] 권한 없음 '+_table)
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
        this.sqlinjection(attributename)
        if(typeof _table =='string') _table = this.check_valid_table(_table, accesstype)

        // if(attributename.startsWith('__')) throw('attributename __로 시작'+attributename)
        // if(!_table[attributename]) throw('attributename __로 시작'+attributename)
        // if(typeof _table[attributename] != 'object') throw('_table[attributename] 객체아님'+attributename)
        const _attribute = get_attribute_from_table(_table, attributename)// _table[attributename]  as dbattribute

        //권한체크
        if(_attribute.__access[1] != 'all') throw('권한 없음')
        return _attribute
    }
    // _table 과 _attribute 따루 주거나, _table 무시하고 _attribute가 [문자].[문자]형식일 떄,
    private check_accessible_attribute_with_dot(_table:string, _attribute:string){
        if (!_table && !_attribute.includes('.')) throw('_attribute에 점이 없음')
        if(_attribute.includes('.')){
            const [tablename, attributename] = _attribute.split('.')
            if(this.check_accessible_attribute(this.sqlinjection(tablename),1,this.sqlinjection(attributename))) return true
            else false
        }else if (this.check_accessible_attribute(_table,1,this.sqlinjection(_attribute))) return true
        else return false
    }
    private check_type_attribute(type:string,value:any){
        if (type == 'INTEGER') {if(!Number.isInteger(value)&&value!=null) throw('type error INTEGER '+value+', '+type)}
        else if (type == 'TEXT') {if(!['string','null'].includes(typeof value)) throw('type error string '+value+', '+type)}
        else if (type == 'BLOB') {if(!['buffer','null'].includes(typeof value)) throw('type error buffer '+value+', '+type)}
        else if (type == 'REAL') {if(!['number','null'].includes(typeof value)) throw('type error number '+value+', '+type)}
        
        return true
        // if (_attribute.__type.toUpperCase() == 'NUMERIC') if(!['number','null'].includes(typeof attribute[attributename])) throw('type error INTEGER'+attributename)
    }

    private is_unique_attribute(_table:string|dbtable, attribute:string[]){
        if(typeof _table =='string') _table = this.check_valid_table(_table, 1)
        const __table = _table
        // __primarykey 이거나 _unique 속성이 먹여야
        // __unique
        
        const __prkey_attribute = []
        const __unique_attribute = []
        for(const key in __table) if(!key.startsWith('__')) {
            const at = get_attribute_from_table(__table, key)
            if(at.__primarykey ) __prkey_attribute.push(key)
            if(at.__unique) __unique_attribute.push(key)
        }
        
        // 모든 prkey가 있으면 ok
        if (__prkey_attribute.every(v=>attribute.includes(v))) return true

        // 하나의 uniqukey가 있어도 ok
        if(__unique_attribute.some(v=>attribute.includes(v))) return true

        return false
    }
    
    // 유효간 속성인지 확인
    private check_getattribute(table:string, attribute:getattribute):[string[], getattribute]{
        const attribute_array:string[] = []
        const sql_dict:getattribute = {}
        for(const key in attribute){
            this.sqlinjection(key) // 표준보다 강력해지는것(?) 안 하면 골치아프다.
            const at =  this.check_accessible_attribute (table,1,key)
            this.check_type_attribute(at.__type,attribute[key])
            attribute_array.push(key)
            sql_dict['$'+key] = attribute[key]
        } 
        return [attribute_array,sql_dict]
    }

    // check_getattribute 실행하고, attribute가 단 하나의 래코드를 가리키는지 확인
    private check_getattribute_where(table:string, attribute:getattribute):[string[], getattribute]{
        const [attribute_array,sql_dict] = this.check_getattribute(table,attribute)
        if(!this.is_unique_attribute(table,attribute_array)) throw(`check_getattribute_where error table:${table} attribute:${attribute}`)
        return [attribute_array,sql_dict]
    }
}