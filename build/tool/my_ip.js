"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.my_ip = void 0;
const os_1 = require("os");
function my_ip() {
    const interfaces = (0, os_1.networkInterfaces)();
    //console.log(interfaces)
    const addresses = [];
    for (const iname in interfaces) {
        const ifs = interfaces[iname];
        if (ifs === undefined)
            continue;
        for (const address of ifs) {
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    return (addresses);
}
exports.my_ip = my_ip;
