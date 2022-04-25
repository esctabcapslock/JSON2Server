"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const path_1 = __importDefault(require("./module/path"));
const http_1 = require("http");
const { port } = server_1.setting;
console.log('[setting]', server_1.setting);
(0, http_1.createServer)((req, res) => {
    console.log(typeof req, typeof res);
}).listen(port, () => console.log(`Server is running at port ${port}`));
const path = new path_1.default();
