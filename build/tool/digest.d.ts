/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
export declare class Digest {
    private realm;
    private nonce;
    private qop;
    private non_authed_nonce;
    private authed_nonce;
    private cnonce;
    private allow_user;
    private salt;
    private pwfn;
    constructor(realm: string | undefined, pwfn: () => string, qop?: string);
    private __create_res;
    private __allow_check;
    private _401;
    private __parse;
    private __create_nonce;
    private __create_auth_nonce;
    server(req: IncomingMessage, res: ServerResponse): Promise<boolean>;
}
