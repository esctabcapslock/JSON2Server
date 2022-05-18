import Path from "./module/path"
import {writefile} from "./module/file"
import { createServer,IncomingMessage,ServerResponse } from 'http'
import { MBDMS } from './module/mdbms';
import { parse_pathname } from './module/sort_functions';
// import {setting} from './server'

// console.log('[setting]',setting);

export default async function main (setting:any){
    const {port} = setting;
    const path = new Path()
    const mdbms = new MBDMS(setting.db)
    path.parse_setting_json(setting)

    // db에 

    createServer(async (req:IncomingMessage,res:ServerResponse)=>{
        try{
            if(req.url==undefined) throw("url이 undefined")
            if(req.headers.host==undefined) throw("host가 undefined")
            if(req.method==undefined) throw("method가 undefined")
            // const url = req.url
            // const host = req.headers.host
            const url = new URL(`http://${req.headers.host}/${parse_pathname(req.url)}`);
            const method = req.method.toUpperCase()

            // db 요청인지 확인
            if(await mdbms.parsehttp(req,res,url,method)) return true
            
            
            // console.log(url,req.headers.host)

            const {type, todo} = await path.parse(req,res)

            if (type=='file'){
                await writefile(res,todo as string,req.headers.range);
            }
            else if (type=='api'){
                res.end('1')
            }else{throw('알 수 없는 type 오류')}
        
        }catch(e){
            console.log('[error--]',e)

            const code_tmp = String(e).match(/\d+/,)
            if(code_tmp) res.statusCode = Number(code_tmp[0])
            else res.statusCode = 404
            res.writeHead(
                code_tmp ? Number(code_tmp[0]) : 404 , {
                "Content-Type": 'text/plain; charset=utf-8',}
            );
            res.end(e); //이거 고처야 함. 정식 릴리즈에는 사용자에게 에러를 보아면 안됨.
        }
    }).listen(port,()=>console.log(`Server is running at port ${port}`))
}