var fs = require('fs');
import {createCipheriv,createDecipheriv,createHash} from 'crypto';
import {IncomingMessage,ServerResponse} from "http"
import {readFileSync,writeFileSync} from 'fs';
import { rejects } from 'assert';
const URL = require('url')
console.log('process.cwd()',process.cwd(), __dirname)

const encrypt = ((val:string) => {
    let cipher = createCipheriv('aes-256-cbc', '1192f16753719483d1b0de41046ea2f4', 'e126cd4e2c172ffc');
    let encrypted = cipher.update(val, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  });
  
const decrypt = ((encrypted:string) => {
    let decipher = createDecipheriv('aes-256-cbc', '1192f16753719483d1b0de41046ea2f4', 'e126cd4e2c172ffc');
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    return (decrypted + decipher.final('utf8'));
});

//KEY can be generated as crypto.randomBytes(16).toString('hex');

const SHA512 = (txt:string)=> createHash('sha512').update(txt).digest('hex');

//레벨 관련.. 여기서는 1: 가벼운 사람, 2: 권한 있는 사람, 3: 관리자. 그외 유리수는 미정
//아님 소수로 해서 합성수는 소인수의 권한을 갖게... 2진법도 마찬가지 => 귀찮음.


function parse_cookies_2_dict(ar:string[]|undefined){
    // console.log('pc',ar)
    if(!ar) return {}

    const out:{[key:string]:string} = {}
    for(const d of ar){
        const dd = d.split(';')[0]
        const ddd = dd.split('=')
        out[ddd.splice(0,1)[0]] = decodeURI(ddd.join('='))
        // console.log('for',d,dd,ddd);
    }
    return out
}

function parse_post_2_url(obj:{[key:string]:string}){
    const out:String[] = []
    for(let i  in obj){
        // encodeURIComponent 안하고 그냥 했다가.. 1시간 날림 ;;;;
        out.push(i+'='+encodeURIComponent(obj[i])) //이부분을 '=' 다음에 안 더해서 한참 오류남
    }
    return out.join('&')
}

function parse_cookies_2_url(obj:{[key:string]:string}){
    const out:String[] = []
    for(let i in obj){
        out.push(i+'='+encodeURI(obj[i])) //이부분을 '=' 다음에 안 더해서 한참 오류남
    }
    // console.log('[parsecookie]',out.join('; '))
    return out.join('; ')
}

type user = {level: number, account:string, pw: string}

export class Login{
    private login_page_url:string
    private pw_change_url:string
    private pw_url:string
    private signup_page_url:string
    private level_page_url:string
    private allowed_cookies:({cookie:string,level:number})[]
    private ip_create_account_count:{[key:string]:number}
    constructor(){
        this.login_page_url = __dirname+'/auth/login.html';
        this.pw_change_url = __dirname+'/auth/change_pw.html';
        this.pw_url = __dirname+'/auth/auth_pw.txt';
        this.signup_page_url = __dirname+'/auth/signup.html';
        this.level_page_url = __dirname+'/auth/set_level.html';
        this.allowed_cookies = [];
        this.ip_create_account_count ={};
    }
    
    private iP_create_account_check(ip:string){ //같은 ip에서 요청 많이 해오면 블락
        console.log('[iP_create_account_check]',this.ip_create_account_count);

        if(!this.ip_create_account_count[ip]) this.ip_create_account_count[ip]=1;
        else this.ip_create_account_count[ip]++;
        if(this.ip_create_account_count[ip]>5) return false;
        return true;
    }
    private get_account_data():user[]{
        const rowdata = readFileSync(this.pw_url).toString()
        if(!rowdata) return [];
        const data = rowdata.split('\n').map(v=>{
            const vv = v.split(' ')
            return {level: Number(v[0]), account:decrypt(v[1]), pw: decrypt(v[2])}
        })
        return data;
    }
    private check_pw(value:user){
        const data = this.get_account_data();
        //console.log('계정 데이터',data);
        const authed = data.some(v=> value.account == v.account && value.pw == v.pw);
        return authed;
    }
    private get_level(value:user){
        const data = this.get_account_data();
        //console.log('ckd',data);
        for(let i=0; i<data.length; i++){
            if(data[i].account == value.account && data[i].pw == value.pw) return data[i].level;
        }
        return false;
    }
    private async set_level(values:user[]){
        values = values.filter(v=>!isNaN(v.level)&&(typeof v.account=='string'));
        console.log('set_lev',values);
        const data = this.get_account_data();
        //console.log('ckd',data);
        for(const v of data){
            for(const vv of values){
                if(v.account == vv.account) v.level = vv.level;
            }
        }
        await this.save_changed_account(data);
        return true
    }
    private check_overlap(account:string){
        const data = this.get_account_data();
        console.log('[check_overlap]',data);
        const authed = data.some(v=> account == v.account);
        return authed;
    }
    private add_account(new_data:user){
        console.log('[add_account]',new_data);
        const data = this.get_account_data();
        console.log('[add_account]',data);
        data.push({level:1,account:new_data.account, pw:new_data.pw});

        this.save_changed_account(data);
    }
    private change_account(value:{account:string,next_pw:string}){
        console.log('[add_account]',value);
        const data = this.get_account_data();

        data.map((v,i,ar)=>{
            if(v.account == value.account) v.pw = value.next_pw;
        })
        this.save_changed_account(data);
    }
    private async save_changed_account(data:user[]){
        const print_data = data.map(v=>`${v.level} ${encrypt(v.account)} ${encrypt(v.pw)}`).join('\n');
        try{
            writeFileSync(this.pw_url, print_data)
        }catch(err){
            console.log('비번 저장 관련 오류',err);
            return false
        }
        return true
        
    }
    private create_cookie(level:number){
        const random = ()=>SHA512('emf'+Math.random()+Date.now())
        let cookie = random()
        while(this.allowed_cookies.some(c=>c.cookie==cookie)) cookie = random() // 중복 방지.
        this.allowed_cookies.push({cookie, level})
        console.log('[set_cookies]',this.allowed_cookies)
        return cookie
    }
    private remove_cookie(cookie:string){
        setTimeout(() => {
            this.remove_cookie_now(cookie);
        }, 600*1000);
    }
    private remove_cookie_now(cookie:string){
        let ind;
        for(ind=0; ind<this.allowed_cookies.length && this.allowed_cookies[ind].cookie!=cookie; ind++);
        console.log('쿠키삭제',ind);
        if (ind>=0 && ind<this.allowed_cookies.length) this.allowed_cookies.splice(ind,1)
    }
    private parse_cookie(str:string):{[key:string]:string}{
        //console.log(str, typeof(str))
        let out:{[key:string]:string}={}
        if(typeof(str)=='string') str.split(';').forEach(i=>{
            var d=i.trim().split('=');
            out[d[0]]=d[1]
        })
        return out
    }
    private check_cookie(cookie:string):[boolean,null|number]{
        //[allowed, level]
        let ind;
        for(ind=0; ind<this.allowed_cookies.length && this.allowed_cookies[ind].cookie!=cookie; ind++);
        //console.log('쿠키체크',ind);
        if (ind<0 || ind>=this.allowed_cookies.length) return [false, null];
        else return[true, this.allowed_cookies[ind].level];
    }
    private post(req:IncomingMessage,res:ServerResponse){ return new Promise<{[key:string]:any}>((resolve,rejects)=>{
        let body = '';
        req.on('data', (chunk)=>body += chunk);
        req.on('end', ()=>{
            if(!body||!body.includes('=')) {
                try{
                    const data=JSON.parse(body);
                    resolve(data); return;
                }catch(err){
                    this.not_auth(res,err)
                    rejects(false); return;
                }
            }
            const data:{[key:string]:string} = {}
            body.split('&').forEach(v=>{let vv = v.split('='); data[vv[0]] = vv.splice(1).join('=')});
            resolve(data)
        })})
    }
    private not_auth(res:ServerResponse,err:any){
        if(err) console.log('[not_auth]',err);

        res.writeHead(401, {'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<script>alert(\`${err}\`)</script><meta http-equiv="refresh" content="0;URL='/auth/login'"/>`)
    }
    public async server(req:IncomingMessage,res:ServerResponse){
        //콜백: 인증 전후에 할 일.  req, res, level값 받음. 미인증이면 level이 null임
        //callback_before_auth: 인증 전에 처리할 일. 처리 완료하면 true, 실패하면 false나, 값을 반환하지 않는다.
        //callback_after_auth: 인증 후에 처리할 일.

        //console.log(req.headers.authorization)
        
        //const authentication = req.headers.authorization ? (new Buffer.from(req.headers.authorization.split(' ')[1], 'base64')).toString('utf8') : '';
        //console.log(authentication);
        const Auth_cookies = this.parse_cookie(req.headers.cookie?req.headers.cookie:'')['Auth']
        const [allowed, level] = this.check_cookie(Auth_cookies)
        const method = req.method
        const url = req.url
        if(!url) {this.not_auth(res,'url 없음'); return;}
        const referer = req.headers.referer
        const pathname = typeof referer == 'string' ? URL.parse(referer).pathname : '';
        
        const ip = String(req.headers['x-forwarded-for'] ||  req.connection.remoteAddress)

        //console.log('로그인=> 상태가',allowed, level, url)

        //이상한 값 확인
        const id_regex = 	/^[a-zA-Z!@#$%^*+=\-0-9가-힣ㄱ-ㅎㅏ-ㅣ]{1,10}$/
        const pw_regex = /^[a-zA-Z!@#$%^*+=\-0-9]{1,30}$/;


        // if(callback_before_auth(req,res,level)) return;

        //url.startsWith('/auth/api/')
        if (['/auth/api/signin', '/auth/api/signup', '/auth/api/update_pw'].includes(url) && method=='POST') {

            try{
                const data = await this.post(req,res)
                if(typeof data.account =='string') data.account = decodeURIComponent(data.account); //아이디는 디코딩시켜거 알아보기 쉽게

                //비밀번호 보호를 위해 끄기 -> 해제하면 노출됨
                console.log('[post_data]', data, '[referer]',pathname);
                
                // 비었으면 리턴
                if(!data.account || !data.pw || !id_regex.test(data.account) || !pw_regex.test(data.pw)) 
                    {throw('올바른 아이디/비밀번호를 입력해주세요.');}
                
                data.pw = SHA512(data.pw); //해싱

                //요청별로...
                if(!allowed && url=='/auth/api/signin' && pathname=='/auth/login'){

                    //인증 안되면 리턴
                    // {level: number, account:string, pw: string}
                    if(typeof data.account != 'string' || typeof data.level!='number' || typeof data.pw!='string' ) throw('올바르지 않는 임력')
                    const check = this.check_pw(data as user);
                    if(!check) throw('해당되는 계정은 존재하지 않습니다. 다시 입력해주세요')


                    //쿠키설청
                    const level = this.get_level(data as user)
                    if(typeof level!='number') throw('level 정보가 없음')
                    const cookie = this.create_cookie(level);
                    res.writeHead(200, {
                        'Content-Type':'text/html; charset=utf-8', 'Content-Location': '/', 
                        'Set-Cookie':[`Auth=${cookie}; Max-Age=600; path=/; HttpOnly`]
                    });
                    this.remove_cookie(cookie)
                    res.end(`<meta http-equiv="refresh" content="0;URL='/'"/>`);
                }
                else if (!allowed && url=='/auth/api/signup' && pathname=='/auth/signup'){

                    if(data.pw_2) data.pw_2 = SHA512(data.pw_2); //해싱                

                    //두 비번 다르면 리턴
                    if(data.pw!=data.pw_2) throw('입력된 두 비밀번호가 일치하지 않음');
                    
                    //아이디 중복시 리턴
                    if(this.check_overlap(data.account))throw('아이디 중복됨');

                    //ip당 제한하기
                    if(!this.iP_create_account_check(ip))
                        {this.not_auth(res,'너무 많은 계정 생성됨'); return;}
                    
                    //아이디 추가
                    if(typeof data.account != 'string' || typeof data.level!='number' || typeof data.pw!='string' ) throw('올바르지 않는 임력')
                    this.add_account(data as user);
                    res.end(`<meta http-equiv="refresh" content="0;URL='/auth/login'"/>`);
                    
                }else if(allowed && url=='/auth/api/update_pw' && pathname=='/auth/edit_pw'){
                    
                    //형식확인
                    if(!pw_regex.test(data.next_pw)) throw('비밀번호 형식을 만족하지 않음');
                    
                    //두 비번 다르면 리턴
                    if(data.next_pw!=data.next_pw_2) throw('입력된 두 비밀번호가 일치하지 않음')

                    //변경하기
                    data.next_pw = SHA512(data.next_pw); //해싱
                    if(typeof data.account != 'string' ) throw('올바르지 않는 임력')
                    this.change_account(data as {account:string,next_pw:string});
                    res.end(`<meta http-equiv="refresh" content="0;URL='/'"/>`);
                }
                else throw('else')
            }catch(e){
                this.not_auth(res,e); return;
            }
        }
        else if(!allowed && url=='/auth/login'){ //로그인
            const file = readFileSync(this.login_page_url)
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8' });
            res.end(file);
        }else if(!allowed && url=='/auth/signup'){ //회원가입
            const file = readFileSync(this.signup_page_url)
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8' });
            res.end(file);
        }else if(!allowed){ //인증X인 기타경우
            res.writeHead(401, {'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<script>alert('로그인이 필요한 기능입니다. 관련 페이지로 이동합니다.')</script><meta http-equiv="refresh" content="0;URL='/auth/login'" /> `)
        }else if(['/auth/login','/auth/signup'].includes(url)){ //인증하고, 로그인/회원가입 시도시 메인페이지로
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<meta http-equiv="refresh" content="0;URL='/'" /> `)
        }
        else if(url=='/auth/edit_pw'){
            const file = fs.readFileSync(this.pw_change_url)
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8' });
            res.end(file);
        }
        else if(url=='/auth/logout'){
            this.remove_cookie_now(Auth_cookies)
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8' });
            res.end('<meta http-equiv="refresh" content="0;URL=\'/\'" />')
        }
        else if(url=='/auth/set_level'){
            if(!level||level<3) {this.not_auth(res,'권한이 없습니다'); return;}

            const file = fs.readFileSync(this.level_page_url)
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8' });
            res.end(file);
        }
        else if(url=='/auth/api/get_level'){
            if(!level||level<3) {this.not_auth(res,'권한이 없습니다'); return;}

            const data = this.get_account_data().map(v=>{return {level:v.level,account:v.account}});
            res.writeHead(200,{'Content-Type': 'application/json; charset=utf8'});
            res.end(JSON.stringify(data));
        }
        else if(url=='/auth/api/set_level' && method=='POST' && pathname=='/auth/set_level'){
            if(!level||level<3) {this.not_auth(res,'권한이 없습니다'); return;}

            const data = await this.post(req,res)

            console.log('권한설정',data);
            if(data.every((v: user)=>typeof v=='object' &&typeof v.account == 'string' && typeof v.level=='number' && typeof v.pw!=='string' )) throw('올바르지 않는 임력')
            await this.set_level(data as user[])
            res.writeHead(200); res.end('ok')
        }
        else return level    
    }
}
