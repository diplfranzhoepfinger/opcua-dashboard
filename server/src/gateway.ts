import WebSocket from "ws";
import net from "net";

export function startGateway(opcuaPort: number, wsPort: number) {
  const wss = new WebSocket.Server({ port: wsPort });

  wss.on("connection", (ws) => {
    console.log("[Gateway] WS client connected");

    const tcpSocket = new net.Socket();
    tcpSocket.connect(opcuaPort, "127.0.0.1");

    tcpSocket.on("connect", () => {
      console.log("[Gateway] TCP connected to OPC UA server");
    });

    tcpSocket.on("data", (data: Buffer) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    ws.on("message", (data: Buffer | ArrayBuffer | Buffer[]) => {
      if (tcpSocket.writable) {
        // ws sends data as Buffer by default for binary messages
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
        tcpSocket.write(buffer);
      }
    });

    ws.on("close", () => {
      console.log("[Gateway] WS client disconnected");
      tcpSocket.destroy();
    });

    tcpSocket.on("close", () => {
      ws.close();
    });

    tcpSocket.on("error", (err) => {
      console.error("[Gateway] TCP error:", err.message);
      ws.close();
    });

    ws.on("error", (err) => {
      console.error("[Gateway] WS error:", err.message);
      tcpSocket.destroy();
    });
  });

  console.log(`[Gateway] WebSocket Gateway listening on ws://localhost:${wsPort}`);
}
