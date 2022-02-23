const fs = require('fs')
const express = require('express');
const request = require('request');
const WRRPool = require('wrr-pool');
const pool = new WRRPool();

const servers = fs.readFileSync('./servers.txt', {
    encoding: 'utf-8'
}).split(/\s/).filter(line => line.replace(/\s/g, '') !== "").map(line => line.replace(/\s/g, ''))

console.log(servers)

servers.forEach(server => {
    pool.add(server, 1)
    // pool.add('A', 4); // pool.add({ host: '10.0.1.10', port: 8087}, 1)
});

// update value to '' and weight to 4 for most use
// pool.update(function (v) {
//     return v === 'https://rpc-mainnet.maticvigil.com/v1/';
// }, 'https://rpc-mainnet.maticvigil.com/v1/', 4); // => returns index of updated element or undefined if not found

// __________________________________________________________
let url = pool.next();

const handler = (req, res) => {
    console.log(url);

    // Pipe the vanilla node HTTP request (a readable stream) into `request`
    // to the next server URL. Then, since `res` implements the writable stream
    // interface, you can just `pipe()` into `res`.
    req.pipe(request({
        url
    })).pipe(res);

    url = pool.next();
};

const server = express().get('*', handler).post('*', handler);

server.listen(5678);
