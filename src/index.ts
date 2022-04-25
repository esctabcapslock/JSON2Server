import {setting} from './server'
import Path from "./module/path"
import {writefile} from "./module/file"
import { createServer,IncomingMessage,ServerResponse } from 'http'
const {port} = setting;
// console.log('[setting]',setting);

(async function main (){
    
    const path = new Path()
    path.parse_setting_json(setting)

    // db에 

    createServer(async (req:IncomingMessage,res:ServerResponse)=>{
        try{
            if(req.url==undefined) throw("url이 undefined")
            if(req.headers.host==undefined) throw("host가 undefined")

            const url = new URL(req.url, `http://${req.headers.host}`);
            // console.log(url,req.headers.host)

            const {type, todo} = await path.parse(req,res,decodeURI(url.pathname))

            if (type=='file'){
                await writefile(res,todo,req.headers.range);
            }
            else if (type=='db'){
                res.end('1')
            }else if (type=='api'){
                res.end('1')
            }else{throw('알 수 없는 type 오류')}
        
        }catch(e){
            console.log('[error]',e)

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