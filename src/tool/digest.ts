import {IncomingMessage,ServerResponse} from "http"
import { createHash } from "crypto";
const MD5 = (txt:string)=> createHash('md5').update(txt).digest('hex');
const SHA256 = (txt:string)=> createHash('sha256').update(txt).digest('hex');
//https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate
//https://feel5ny.github.io/2019/11/24/HTTP_013_01/

//Digest 해시 알고리즘 크롬:SHA256X, 파폭:O. SHA512는 둘 다 지원 안 함. 사파리는 셋 다 지원 안 함.
//https://bugs.chromium.org/p/chromium/issues/detail?id=1160478

type Auth = {
    username:string,
    realm:string,
    nonce:string,
    uri:string,
    algorithm:string,
    nc:string,
    cnonce:string,
    qop:string,
    response:string,
}


export class Digest{
    private realm:string
    private nonce:string;
    private qop:string
    private non_authed_nonce:string[]
    private authed_nonce:string[]
    private cnonce:string[]
    private allow_user:string[]
    private salt:string
    private pwfn:()=>string
    constructor(realm:string='/', pwfn:()=>string, qop:string='auth'){
        this.realm = realm?realm:'/'; //접근 영역
        this.qop = qop?qop:'auth'
        this.non_authed_nonce = [];
        this.authed_nonce = [];
        this.cnonce = []
        this.nonce = this.__create_nonce()
        this.allow_user = ['1']
        this.pwfn = pwfn
        this.__create_nonce()
        this.salt = `${Math.random()} ${new Date()}`
        //선택된 보호 수준 (quality of protection, qop)
        //https://feel5ny.github.io/2019/11/24/HTTP_013_01/
    }

    private __create_res(auth:Auth,nonce:string, method:string){
        // console.log(this, this,this.pwfn())
        const password = this.pwfn();
        //const method = 'GET'

        const HA1 = MD5(`${auth.username}:${this.realm}:${password}`)
        const HA2 = MD5(`${method}:${auth.uri}`);
        const response = MD5(`${HA1}:${nonce}:${auth.nc}:${auth.cnonce}:${auth.qop}:${HA2}`) 
        if (response != auth.response) return false;
        return true;
    }

    // 권한 있는 사용자인지 확인한다
    private __allow_check(auth:Auth, method:string){
        //Digest username="1", realm="hihi", nonce="", uri="/", response="a749cf378780db83f455b7ed16404252"
        //Digest username="1", realm="/", nonce="ed90be88623e39bfbd799cc3bd1b2ad3", uri="/", response="739bde2cbde77598bec6d91b5c43a5b3", qop=auth, nc=00000001, cnonce="c0c9ac7a2aab0d9a"
        
        if(!auth || !this.allow_user.includes(auth.username)) return false;
        // console.log('[인증요청확인]',auth, this.nonce)

        if(this.__create_res(auth, this.nonce, method)) {
            console.log('[인증성공!] 현재 논스에 부합. ')
            this.__create_nonce(); //인증했으니 논스 무효화!
            return true;
        }

        if(this.non_authed_nonce.some((nonce,i)=>{
            if(this.__create_res(auth, nonce, method)){
                console.log('[인증 성공!] 처음 인증 목록에 논스 있음. ')
                //인증했으니 논스 무효화!
                this.authed_nonce.push(nonce) 
                this.non_authed_nonce.splice(i,1);
                return true
            }
        })) return true

        console.log('[인증 실패]')
        return false;

    }

    private _401(res:ServerResponse, url:string, err:any){
        console.error('_404 fn err', url, err) 
    }

    private __parse(txt:string|undefined):Auth|undefined{
        if(typeof txt != 'string') return undefined;
        
        const sp_data = txt.split(' ');
        if(sp_data[0]!='Digest') return undefined;

        const out:any = {}
        try{
            sp_data.splice(1).forEach(element => {
                let v = element.split('=')
                out[v[0]] = v[1].substr(0,v[1].length-1).replace(/\"/g,'')
            });
        }catch{
            console.log('파싱 오류!')
            return undefined;
        }
        // console.log('[pp]',out)
        if (typeof out.username != 'string') return undefined
        if (typeof out.realm != 'string') return undefined
        if (typeof out.nonce != 'string') return undefined
        if (typeof out.uri != 'string') return undefined
        if (typeof out.algorithm != 'string') return undefined
        if (typeof out.nc != 'string') return undefined
        if (typeof out.cnonce != 'string') return undefined
        if (typeof out.qop != 'string') return undefined
        if (typeof out.response != 'string') return undefined
        return out;
    }
    
    private __create_nonce():string{
        const nonce_tmp = SHA256(`${this.salt} ${Math.random()**2} ${new Date()}`)
        this.authed_nonce.push(nonce_tmp)  //없을 떄(ex. 처음 시작시) 방지
        // console.log('[create_nonce]', nonce_tmp)
        return nonce_tmp
        
        // this.nonce = 
    }

    private __create_auth_nonce(){
        if(this.non_authed_nonce.length>30) this.non_authed_nonce = this.non_authed_nonce.splice(this.non_authed_nonce.length-30); //너무 크면 자른다.

        const nonce = SHA256(`${this.salt} ${Math.random()**2} ${new Date()}`)
        // console.log('[create_auth_nonce]', nonce)
        this.non_authed_nonce.push(nonce)
        return nonce;
    }
    
    public async server(req:IncomingMessage,res:ServerResponse){
        const method = req.method
        const auth = this.__parse(req.headers?.authorization);

        // console.log('[auth]',auth,req.headers.authorization)
        if((req.headers.authorization && !auth) || !method){ //인증 요청안에 이상한 걸 넣었을 경우 or method가 이상한 것
            res.writeHead(400)
            res.end('400 Bad Request');
            return false;
        }

        //인증X경우
        if(!auth || !this.__allow_check(auth, method)){
            //과거에 인증한 이력이 있는 논스
            if(auth && this.authed_nonce.includes(auth.nonce)){
                console.log('인증했음')
                res.writeHead(401, {'WWW-Authenticate':`Digest stale=true, realm="${this.realm}", nonce="${this.nonce}", qop="${this.qop}", algorithm=MD5`});
                // algorithm=SHA-256
            }
            else {
                console.log('인증X했음')
                res.writeHead(401, {'WWW-Authenticate':`Digest realm="${this.realm}", nonce="${this.__create_auth_nonce()}", qop="${this.qop}", algorithm=MD5`});
            }
            res.end('401 인증요함');
            return false;
            //algorithm=SHA-512
        }


        //else res.setHeader('Authentication-Info', `nextnonce="${this.nonce}"`); //없는 듯?
        // console.log(`nextnonce="${this.nonce}"`)
        return true
    }
}