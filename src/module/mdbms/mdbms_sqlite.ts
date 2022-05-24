import {sqlite3,Database} from 'sqlite3'
import {MDBMS_DB} from './mdbms_db'
import {Dbtable,Dbattribute,Getoption,Getattribute,sqlallout, stringobj} from './mdbms_type'
import {check_string_array, is_string_array} from '../sort_functions'

export class MDBMS_SQLite extends MDBMS_DB{
    private sqlite3:sqlite3
    private db:Database
    constructor(key:string, path:string,dir:string,file:{[key:string]:any}){
        if(!file.__dir) file.__dir=key+'.sqlite' //확장자 붙히기 위해
        super(key,path, dir,file)
        this.sqlite3 = require('sqlite3').verbose();
        // this.__dir = '/'+this.__dir
        console.log('[this.__dir] - MDBMS_SQLite',__dirname, this.dir)
        require('fs').writefile
        this.db = new this.sqlite3.Database(this.dir)
        
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

        console.log('setting]t his.__dir',this.dir)
        if(!this.sqlite3) this.sqlite3 = require('sqlite3').verbose();
        
        console.log('setting]t his.__dir2',this.dir)
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
            for(const tablename in this.file.data) if(!tablename.startsWith('__')){
                //console.log('[this.file[tablename]',tablename,this.file[tablename])
                if(!exist_table_names.includes(tablename)){
                    const _table:Dbtable = this.file.data[tablename]

                    const create_sql_bytable = (tablename:string,table:Dbtable) =>{
                        let out = `CREATE TABLE "${this.sqlinjection(tablename)}"(\n`
                        const attribute_sql_list = []
                        for(const attributename in table.data) {//if(!attributename.startsWith('__'))
                            console.log('[table[attributename]',attributename,table.data[attributename])
                            attribute_sql_list.push(create_sql_by_attribute(attributename,table.get_attribute(attributename)))
                        }
                        out += attribute_sql_list.join(',\n') + '\n)'
                        console.log('[create_sql_bytable]',out)
                        return out
                    }

                    const create_sql_by_attribute = (attributename:string,attribute:Dbattribute)=>{
                        let out = `"${this.sqlinjection(attributename)}"    ${this.sqlinjection(attribute.type.toUpperCase())} `
                        const settings = []
                        if(attribute.primarykey) settings.push('PRIMARY KEY')
                        if(attribute.autoincrement) settings.push('AUTOINCREMENT')
                        if(attribute.default) settings.push('DEFAULT '+(
                            typeof attribute.default == 'number')?attribute.default:
                            (attribute.default=='null'||attribute.default==null)?'null':`"${this.sqlinjection(attribute.default)}"`)
                        if(attribute.unique) settings.push('UNIQUE')
                        if(attribute.notnull) settings.push('NOT NULL')
                        if(attribute.check) settings.push(`CHECK ${this.sqlinjection(attribute.check)}`)

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
    public async get(table:string,attribute:string[],  where:Getattribute|null=null, option:Getoption|null=null){
        // option  조건:
        //attribute에 있어야 함.
        if(!option) option = new Getoption({join:undefined,limit:undefined,as:undefined,order:undefined}) //{join:undefined,limit:undefined,as:undefined,order:undefined}
        // 테이블 가능 확인
        const _table = this.file.tablestring2table(table).check_valid_table(1)
        
        try{
            
            // 속성을 요청했는지 확인
            if(!is_string_array(attribute) || attribute.length==0) throw(`table:${table} attribute 길이가 0이거나 배열이 아님`)
            // 접근 가능한 속성인지 확인
            for (const val of attribute) this.file.check_accessible_attribute_with_dot(table,val,this.sqlinjection) //) req_attribute.push(val)
            // option 유효성 확인
            this.file.check_accessible_getoption(table,option,this.sqlinjection)
        }catch(e){
            throw(`400 [sqlite db get] 요청사항의 문제. e:${e}`)
        }

        const [where_array, where_sql_dict] = where!=null ? _table.check_getattribute_where(where,false,this.sqlinjection,this.check_type_attribute) : [[],{}];

        //sql문 생성
        let sql = `SELECT`
        sql += ' ' + attribute.map(v=> {
            if(option?.as && v in option.as) return `${v} AS ${option.as.get(v)}`  
            else return v
        }).join(',') + ` FROM ${table}`
        if(option.join) for(const val in option.join){

            const [tablename, attributename] = option.join.get(val);

            sql+=`
            LEFT OUTER JOIN ${tablename} ON
            ${val} = ${tablename}.${attributename}
            `
            
        }
        if(option.limit) sql += `\nlimit ${option.limit}`
        if(option.order) sql += `\n ORDER BY ${option.order.column} ${option.order.order}`
        if(where) sql += `${where_array.map(v=>`${v}=$${v}`).join(' AND ')}` // 등호 1개 맞음


        // whele문 작성

        // 실행
        const insert_out = await this.getdb(sql,where_sql_dict)
        console.log('[insert_out],',insert_out)
        return insert_out
        // 아마 반환하는거 타입이 {[key:string]:string|null|number}[]일텐데... 확실하지 않네?
    }
    //데이터 추가
    public async post(table:string,attribute:Getattribute, option:null=null){
        const _table = this.file.tablestring2table(table).check_valid_table(1)

        const [attribute_array, attribute_dict] = _table.check_getattribute(attribute,this.sqlinjection,this.check_type_attribute)

        const sql = `INSERT INTO ${this.sqlinjection(table)}
                     (${attribute_array.join(', ')}) VALUES(${attribute_array.map(v=>`$`+v).join(',')});`
        const insert_out = await this.getdb(sql,attribute_dict)
        console.log('[insert_out],',insert_out)
        // 그 밖에 notnull 배먹은 키는 sql이 잘 거르겠지??
        // 타입체크하기
        // 접근 가능하면
    }
    //데이터 수정
    public async put(table:string,attribute:Getattribute,where:Getattribute, option:null=null){
        const _table = this.file.tablestring2table(table).check_valid_table(1)

        const [where_array, sql_dict1] = _table.check_getattribute_where(where,true,this.sqlinjection,this.check_type_attribute)
        const [attribute_array, sql_dict2] = _table.check_getattribute(attribute,this.sqlinjection,this.check_type_attribute)
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
    public async delete(table:string,where:Getattribute, option:null=null){
        const _table = this.file.tablestring2table(table).check_valid_table(1)

        const [where_array, sql_dict] = _table.check_getattribute_where(where,true,this.sqlinjection,this.check_type_attribute)
        const __table = this.file.tablestring2table(table).check_valid_table(1)

        if(!__table.is_unique_attribute(where_array)) throw('[delete] error')
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
    
    
    private check_type_attribute(type:string,value:any){
        if (type == 'INTEGER') {if(!Number.isInteger(value)&&value!=null) throw('type error INTEGER '+value+', '+type)}
        else if (type == 'TEXT') {if(!['string','null'].includes(typeof value)) throw('type error string '+value+', '+type)}
        else if (type == 'BLOB') {if(!['buffer','null'].includes(typeof value)) throw('type error buffer '+value+', '+type)}
        else if (type == 'REAL') {if(!['number','null'].includes(typeof value)) throw('type error number '+value+', '+type)}
        
        return true
        // if (_attribute.__type.toUpperCase() == 'NUMERIC') if(!['number','null'].includes(typeof attribute[attributename])) throw('type error INTEGER'+attributename)
    }
}