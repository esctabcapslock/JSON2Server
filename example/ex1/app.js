// import {setting} from './server'
// import main from '../../build'
setting = require('./server')
main = require('../../index')
console.log('app ex1',{__dirname, main})
main(setting)