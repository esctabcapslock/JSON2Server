import {setting} from './server'
import Path from "./module/path"
import {writefile} from "./module/file"
import { createServer,IncomingMessage,ServerResponse } from 'http'
import { MBDMS } from './module/mdbms';
const {port} = setting;
// console.log('[setting]',setting);

(async function main (){
    
    const path = new Path()
    const mdbms = new MBDMS(setting)
    path.parse_setting_json(setting)

    // db에 

    createServer(async (req:IncomingMessage,res:ServerResponse)=>{
        try{
            if(req.url==undefined) throw("url이 undefined")
            if(req.headers.host==undefined) throw("host가 undefined")

            
            // console.log(url,req.headers.host)

            const {type, todo} = await path.parse(req,res)

            if (type=='file'){
                await writefile(res,todo as string,req.headers.range);
            }
            else if (type=='db'){
                const _todo = todo as {method:string,file:string,table:string,attribute:string|{[key:string]:string},option:{[key:string]:string}}
                await mdbms.parsehttp(res,_todo.method,_todo.file,_todo.table,_todo.attribute,_todo.option)
                
            }else if (type=='api'){
                res.end('1')
            }else{throw('알 수 없는 type 오류')}
        
        }catch(e){
            console.log('[error-]',e)

            const code_tmp = String(e).match(/\d+/,)
            if(code_tmp) res.statusCode = Number(code_tmp[0])
            else res.statusCode = 404
            res.writeHead(
                code_tmp ? Number(code_tmp[0]) : 404 , {
                "Content-Type": 'text/plain; charset=utf-8',}
            )
            res.end(e) //이거 고처야 함
        }
    }).listen(port,()=>console.log(`Server is running at port ${port}`))
})()