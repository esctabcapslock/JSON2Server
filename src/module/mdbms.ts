
import {IncomingMessage,ServerResponse } from 'http'
type dbsetting = {__type:string,__path:string|undefined,__dir:string|undefined,[key:string]:string|dbfile|undefined}
type dbfile = {__path:string|undefined,__dir:string|undefined,[key:string]:dbtable|string|undefined}
type dbtable = {[key:string]:dbattribute}
type dbattribute = {__type:string,__promarykey:boolean|undefined,__autucount:boolean|undefined,__notnull:boolean|undefined,}


function create_dbsetting(type:string):dbsetting{
    const out:dbsetting = {
        __type:type,
        __path:'/db',
        __dir:'/db',
    }
    return out
}
function create_dbfile(path:string, dir:string):dbfile{
    const out:dbfile = {
        __path:path,
        __dir:dir,
    }
    return out
}

function parse_pathname(path:string){
    return path.replace(/\\/gi,'/').replace(/^(\.?)\//,'').replace(/\/$/,'')
}

function parse_connect_pathname(lpath:string,rpath:string){//결로를 합친다.
    if (rpath.startsWith('/')) return '/'+parse_pathname(rpath);
    else return  lpath+'/'+parse_pathname(rpath); 
}

class MBDMS{//Management System for DataBase Management System
    
    
    public parsesetting(setting:dbsetting){
        // this.settime = setting
        this.settime.__path = setting.__path?setting.__path:'/db'
        this.settime.__dir = setting.__dir?setting.__dir:'/db'
        for (const  key in setting){
            if (key.startsWith('__') && !['__type','__path','__dir'].includes(key)) throw('[parsesetting], key없음 '+key)
            const file = setting[key] as dbfile
            if (typeof file != 'object') throw('[parsesetting] 잘못된 객체');
            file.__path = parse_connect_pathname(this.settime.__path,file.__path?file.__path:key)
            file.__dir = parse_connect_pathname(this.settime.__dir,file.__dir?file.__dir:key)
            const _cfile = create_dbfile(file.__path,file.__dir)
            this.settime[key] = _cfile
            for(const tablename in file){
                if (key.startsWith('__') && !['__path','__dir'].includes(key)) throw('[parsesetting], tablename key없음 '+tablename)
                file[tablename]
            }
        }

        return this
    }

    private settime:dbsetting
    constructor(setting:dbsetting){
        if(typeof setting.__type != 'string') throw('[__tpye string 아님') 
        this.settime = create_dbsetting(setting.__type)
        this.parsesetting(setting)
        // this.settime = setting
        
        
    }

    public parsehttp(req:IncomingMessage,res:ServerResponse){
        const method = req.method
        const url = req.url
        // RESTful API에 맞도록 설계해보자
        // http://localhost/[__dir]/[tablename]/[attribute]?value=[value] 이런식으로 만들까?
        // GET(읽기), GET, POST(생성), PUT(수정), DELETE(삭제)
        // 예를 들면 음악재생기에서, 곡정보, 엘범정보 읽어서 동시에 가져왔던건? 다시 말해 join을 처리 못하는건 어케하지? 클라이언트에서 처리하면?
        // 전송 오버해드가 커질 수(작아질 수도)있고, 클라이언트가 힘들어함;;;, 서버측 코드가 간단하다!
        // 내부 API에서도 호출할 수 있게끔 [parse 함수를 서버부분과 db부분으로 나누자.]
        // selete문, join을 처리하기 위해 기능을 추가해야함
        // orderby는 순서, limit는 가져올 문서 개수
    }

    //데이터 읽기
    public get(file:string,table:string,attribute:MDBMS_attribute, option:any|undefined){


    }
    //데이터 추가
    public post(file:string,table:string,attribute:MDBMS_attribute, option:any|undefined){

    }
    //데이터 수정
    public put(file:string,table:string,attribute:MDBMS_attribute, option:any|undefined){

    }
    //데이터 삭제
    public delete(file:string,table:string,attribute:MDBMS_attribute, option:any|undefined){

    }


     
}

class MDBMS_file{ //db 파일 하나를 관리
    
}
class MDBMS_table{ //db 테이블 하나를 관리

}
class MDBMS_attribute{//db 속성 하나를 관리

}

class Msqlite extends MBDMS{
    
    constructor(setting:dbsetting){
        super(setting)
    }
    private set f1(x:string){
        1+2;
    }

    // set settime(_settime:dbsetting){
    //     console.log(12)
    //     this.settime = _settime
    // }

    private get g1(){
        return 3
    }

    #fdfs(){
        console.log(13)
    }
}

const mBDMS = new MBDMS({__type:"sqlite3",__path:undefined,__dir:undefined})
mBDMS.post('db1','students',{name:'krr'},undefined) // 추가
mBDMS.get('db1','students',{name:'krr'},{order:'min'}) // 데이터 읽기
// mBDMS.get()