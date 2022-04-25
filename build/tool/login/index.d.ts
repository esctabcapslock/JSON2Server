/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
export declare class Login {
    private login_page_url;
    private pw_change_url;
    private pw_url;
    private signup_page_url;
    private level_page_url;
    private allowed_cookies;
    private ip_create_account_count;
    constructor();
    private iP_create_account_check;
    private get_account_data;
    private check_pw;
    private get_level;
    private set_level;
    private check_overlap;
    private add_account;
    private change_account;
    private save_changed_account;
    private create_cookie;
    private remove_cookie;
    private remove_cookie_now;
    private parse_cookie;
    private check_cookie;
    private post;
    private not_auth;
    server(req: IncomingMessage, res: ServerResponse): Promise<number | null | undefined>;
}
