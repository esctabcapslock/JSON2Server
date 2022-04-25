"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_file = void 0;
const fs_1 = require("fs");
const NFC_NFD_1 = require("./NFC-NFD");
function filiter_filename(file_name) {
    file_name = (0, NFC_NFD_1.NFD2NFC)(file_name);
    const file_name_list = file_name.match(/\s|[()]|[+-.]|[0-9]|@|[A-Z]|\[|\]|_|[a-z]|[가-힣]|[ㄱ-ㅎ]|[ᄀ-ᅞ]|[ᅡ-ᇿ]/g); //일부 문자(한/영)만 허용함.
    if (Array.isArray(file_name_list))
        file_name = file_name_list.join('');
    else
        file_name = '';
    //파일 이름은 글자 수 100자 이내
    let tmp_filename = file_name.split('.');
    if (tmp_filename.length >= 2) {
        // 확장자 있는 경우. 파일이름<100, 확장자명<10 제한
        let me = tmp_filename.splice(-1)[0];
        file_name = tmp_filename.join('').substr(0, 100) + '.' + me.substr(0, 10);
    }
    else {
        file_name = file_name.substr(0, 100);
    }
    return file_name;
}
function get_file(req, res, streampath = './tmp/', savepath = './files/') {
    return new Promise((resolve, rejects) => {
        const method = req.method;
        if (method != 'POST')
            throw ('400 허용되지 않는 방법');
        const df = x => x.replace(/\n/g, '\\n+\n').replace(/\r/g, '\\r');
        const ReLU = x => x > 0 ? x : 0;
        //let post_data = [];
        //https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
        //let file_list = fs.readdirSync('./files')
        const promise_list = [];
        let post_data_len = 0;
        let file_size_maximum = 2 * 1024 * 1024 * 1024; //2GB
        let past_data = Buffer.from([]);
        let file_name = '';
        let boundary = '';
        let 단계 = 1; // 0: 시작안함. 1: 해더 분석중, 2: 본문 내용 파싱, 3: 다음 바운더리 찾기.
        let front = 0;
        let end = 0;
        let 진행중 = true;
        let 오류 = false;
        // let cnt = 0
        let stream = null;
        let mylog = () => { }; //console.log// ()=>{}//console.log
        const 중복파일_목록_알림용 = []; //사용자가 같은 이름을 갖은 파일을 업로드하면, 반영하지 않고 오류라고 알려준다.
        req.on('data', (data) => {
            // let now_cnt = cnt;
            // cnt++;
            if (file_size_maximum < post_data_len) {
                if (!오류) {
                    console.log('용량초과');
                    req.emit('error');
                    오류 = true;
                }
                //요청.pause()
                //요청.destroy()
                //요청.destroy(Error('Payload Too Large'))
                return;
            }
            if (!진행중)
                return;
            console.log('\n\ndata 조각 받음', data.length, post_data_len, file_size_maximum, past_data.length, '[진행중]', 진행중, '단계', 단계, '[file_name]', file_name);
            let 아무것도안함 = true;
            let 루프 = true;
            post_data_len += data.length;
            const now_data = Buffer.concat([past_data, data]);
            //console.log('\nnow_data - 받음.\n',df(now_data.toString()),'끝!\n');
            let cnt_tmp = 0;
            let end = -1;
            while (루프) {
                if (단계 == 1) {
                    end = now_data.indexOf('\n', front);
                    if (end == -1)
                        루프 = false; //시작할 수 없음!
                    while (true) {
                        아무것도안함 = false;
                        let tmp = now_data.slice(front, end - 1).toString();
                        console.log('tmp', front, end, tmp.length, tmp.length < 100 ? (df(tmp)) : '[생략]');
                        if (!boundary)
                            boundary = tmp;
                        if (!file_name && tmp.includes('Content-Disposition:') && tmp.includes('filename=')) {
                            let foo = tmp.substring(tmp.indexOf('filename=') + 9, tmp.length);
                            file_name = foo.substring(1, foo.substr(1).indexOf('"') + 1);
                            //file_name = foo.substring(1,foo.length-1)
                            console.log('[file_name]', file_name);
                            file_name = filiter_filename(file_name);
                            console.log('[file_name]', file_name);
                            if ((0, fs_1.existsSync)('./files/' + file_name) || (0, fs_1.existsSync)('./tmp/' + file_name)) {
                                중복파일_목록_알림용.push(file_name);
                                file_name = '';
                                if (stream) {
                                    stream.end();
                                    stream = null;
                                }
                            }
                            else {
                                stream = (0, fs_1.createWriteStream)(streampath + file_name, { flags: 'wx' });
                            }
                        }
                        front = end + 1;
                        end = now_data.indexOf('\n', end + 1);
                        if (end == -1)
                            루프 = false; //시작할 수 없음!
                        if (!tmp || !tmp.length) {
                            단계 = 2;
                            break;
                        }
                    }
                }
                if (단계 == 2) {
                    end = now_data.indexOf(boundary, front) - 2;
                    if (end == -3) {
                        //console.log('-1임..',end)
                        if (boundary.length < data.length) { // 바운더리가 없는 경우에는... past_data 부분만 생각하자.
                            end = past_data.length;
                        }
                        else { //데이터 안에 boundary가 들어 있을 수 있음.
                            break; //다음으로 넘기자.
                        }
                        루프 = false;
                        //console.log('-1임.. 후',end)
                    }
                    else {
                        console.log('-1 아님음..', end);
                        단계 = 3;
                        //end+=2;
                    }
                    if (!file_name) {
                        아무것도안함 = false;
                        break;
                    }
                    let filedata = now_data.slice(front, end);
                    아무것도안함 = false;
                    console.log('[데이터 부분] front-end', front, end, past_data.length, data.length, now_data.length, file_name, '[boundary]', df(boundary), '[file_name]', file_name, '[data_tmp]', filedata.length);
                    if (file_name && stream) {
                        let dnyp = stream.write(filedata); // fs.appendFileSync('./files/'+file_name, filedata)
                        console.log('데이터 조각 저장', dnyp);
                        // fs.appendFile('./files/'+file_name, filedata, null, (E) => {
                        //     if(E) console.log('파일 오류', E);
                        // })
                    }
                }
                if (단계 == 3) {
                    //file_list.push(file_name)
                    const p1 = new Promise((resolve, reject) => {
                        let callback = (name => {
                            return () => {
                                console.log('스트림 종료!!', name);
                                (0, fs_1.rename)(streampath + name, savepath + name, (err) => {
                                    if (err) {
                                        console.log(err);
                                        resolve('');
                                    }
                                    else {
                                        console.log('성공적으로 옮겨짐.');
                                        resolve(name);
                                    }
                                });
                            };
                        })(file_name);
                        if (stream)
                            stream.end(callback);
                        else
                            resolve('');
                    });
                    promise_list.push(p1);
                    file_name = '';
                    stream = null;
                    아무것도안함 = false;
                    end += 2;
                    front = end;
                    end = now_data.indexOf('\n', end);
                    let boundary = now_data.slice(front, end).toString();
                    console.log('front-end', front, end, 'new boundary', df(boundary));
                    boundary = boundary.replace(/\r/g, '').replace(/\r\n/g, '');
                    front = end + 1;
                    end = now_data.indexOf('\n', end + 1);
                    단계 = 1;
                    if (boundary.endsWith('--')) {
                        break;
                        진행중 = false;
                    }
                }
            }
            if (아무것도안함)
                past_data = now_data;
            else {
                //위치 조절하기.
                front = ReLU(front - past_data.length);
                end = ReLU(end - past_data.length);
                past_data = data;
            }
        });
        req.on('end', () => {
            if (stream)
                stream.end();
            stream = null;
            console.log('[promise_list]', promise_list);
            Promise.all(promise_list).then(d => resolve(true));
            if (file_size_maximum < post_data_len) { //file_size_maximum(1GB)가 넘는 파일을 보냈을 때,
                res.writeHead(413, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<script>alert("Payload Too Large"); location="/";</script>');
                resolve(false);
                return;
            }
            else if (중복파일_목록_알림용.length) {
                console.log('[중복파일_목록_알림용]', 중복파일_목록_알림용);
                res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<script>alert(unescape("${escape('[' + 중복파일_목록_알림용.join(', ') + '] 들과/와 같이 중복된 이름의 파일은 업로드 할 수 없습니다.')}"));location="/";</script>`);
            }
            else {
                res.writeHead(303, { 'location': '/' });
                res.end('');
            }
            resolve(false);
            return;
        });
        req.on('error', () => {
            console.log('[pause event]');
            if (stream) {
                stream.end();
                stream = null;
            }
            if (file_name && (0, fs_1.existsSync)('./tmp/' + file_name)) {
                (0, fs_1.unlink)('./tmp/' + file_name, err => {
                    if (err)
                        console.log('err>Err', err);
                    file_name = '';
                    rejects(err);
                });
            }
            //응답.writeHead(413, {'Content-Type': 'text/html; charset=utf-8'});
            //응답.end(`<script>alert("너무 긴(${parseInt(file_size_maximum/1024/1024)}MB) 파일"); location="/";</script>`);
        });
    });
}
exports.get_file = get_file;
