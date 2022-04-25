import {ServerResponse} from "http"
import {createReadStream, statSync, existsSync} from "fs"


function get_file_type(mime:string){
    if (['txt','css','js','ts','html'].includes(mime)){
        return `text/${mime=='txt'?'plain':mime.replace('js','javascript')}; charset=utf-8`;
    }else return 'application'
}

export async function writefile(res:ServerResponse,pathname:string,range:string|undefined){
    try {
        // console.log('writefile1',pathname)
        if(!existsSync(pathname)) throw('404 file not in server')
        // console.log('writefile2')
        const stats = statSync(pathname)
        if(stats.isDirectory()) throw('404 this is directory, can not streaming ')

        // const file_name = pathname.split('/').splice(-1)[0]
        const mime = pathname.split('.').splice(-1)[0]
        const parts = range == undefined ? undefined : range.replace(/bytes=/, "").replace(/\/([0-9|*]+)$/, '').split("-").map(v => parseInt(v));
        const file_type = get_file_type(mime)

        if (!parts || parts.length != 2 || isNaN(parts[0]) || parts[0] < 0) {
            res.writeHead(200, {
                'Content-Type': file_type,
                'Content-Length': stats.size,
                'Accept-Ranges': 'bytes',
            });
            const readStream = createReadStream(pathname)
            readStream.pipe(res);
        } else {
            const start = parts[0];
            const MAX_CHUNK_SIZE = 1024 * 1024 * 10;
            const end = Math.min((parts[1] < stats.size - 1) ? parts[1] : stats.size - 1, start + MAX_CHUNK_SIZE - 1)
            console.log('[file-분할전송 - else]', start, end, '크기:', stats.size, parts);
            const readStream = createReadStream(pathname, { start, end });
            res.writeHead((end == stats.size) ? 206 : 206, { //이어진다는 뜻
                'Content-Type': file_type,
                'Accept-Ranges': 'bytes',
                'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                'Content-Length': end - start + 1,
            });
            //-1 안 하면 다 안받은 걸로 생각하는듯?
            readStream.pipe(res);
        }
    } catch (e) {
        throw (`404 file not exist ${e}`)
    }
}