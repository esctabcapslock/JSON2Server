/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
export declare function get_file(req: IncomingMessage, res: ServerResponse, streampath?: string, savepath?: string): Promise<unknown>;
