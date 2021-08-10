#!/usr/bin/env node
"use strict";
/*
 * Use to debug html/javascript UI and emulate some aspects of device communication via websockets.
 * Connect websocket on localhost:81, send message 'test', receive binary structure.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const server = http.createServer(app);
require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});
server.listen(81, function () {
    console.log(new Date() + " Server is listening on port 81");
});
const wsServer = new WebSocket.Server({ server });
function fillBinaryStruct(buf, { timestamp, lineNumber, dataArray }) {
    const view = new DataView(buf);
    view.setBigInt64(0, timestamp);
    view.setInt8(8, lineNumber);
    for (let i = 0; i < dataArray.length; ++i) {
        view.setInt8(9 + i, dataArray[i]);
    }
}
function testOutput(ws) {
    setTimeout(() => {
        const dataLength = 4;
        const sizeof = 8 + 1 + dataLength;
        const LINE_RX = 1;
        const data = [];
        for (let i = 0; i < dataLength; ++i) {
            data[i] = i;
        }
        const buf = new ArrayBuffer(sizeof);
        fillBinaryStruct(buf, {
            timestamp: BigInt(0),
            lineNumber: LINE_RX,
            dataArray: data,
        });
        ws.send(buf, { binary: true, compress: false });
    }, 1000);
}
wsServer.on("connection", function (ws) {
    console.log(new Date() + " Connection accepted.");
    ws.on("message", (incomingMessage) => {
        // output to received message to console
        if (incomingMessage instanceof String) {
            console.log("Received Message: " + incomingMessage);
        }
        else if (incomingMessage instanceof ArrayBuffer) {
            console.log("Received Binary Message of " +
                incomingMessage.byteLength +
                " bytes");
        }
        if (incomingMessage instanceof String) {
            if (incomingMessage.startsWith("test")) {
                testOutput(ws);
            }
        }
    });
});
//# sourceMappingURL=server.js.map