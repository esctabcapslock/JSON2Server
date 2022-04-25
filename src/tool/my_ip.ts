import {networkInterfaces} from "os"
export function my_ip(){
const interfaces = networkInterfaces();
//console.log(interfaces)
const addresses:string[] = [];
for (const iname in interfaces) {
    const ifs = interfaces[iname]
    if(ifs==undefined) continue
    for (const address of ifs) {
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
return(addresses)
}