# OPC UA Server (open62541 v1.5)

Server-Implementierung basierend auf [open62541](https://open62541.org/) v1.5 mit nativer WebSocket-Unterstützung über einen custom `UA_ConnectionManager`.

## Vorteile gegenüber Node.js Server

- **Kein separates Gateway** – open62541 spricht direkt WebSocket
- **Native Performance** – C-Code, kein Node.js Overhead
- **Einfacher Aufbau** – Ein einziges Binary

## Architektur

open62541 v1.5 nutzt einen zentralen `UA_EventLoop`. Netzwerk-Verbindungen werden über `UA_ConnectionManager`-Plugins gehandhabt. Dieser Server registriert einen custom **WebSocket ConnectionManager** (`eventloop_posix_ws.c`) beim EventLoop, der libwebsockets in Server-Mode verwendet und das `opcua+uacp` Subprotokoll spricht.

### Gepatchte open62541 Dateien

- `src/util/ua_util.c` – `UA_parseEndpointUrl` erweitert für `opc.ws://` und `opc.wss://`
- `src/server/ua_server_binary.c` – `createServerConnection` akzeptiert jetzt auch `"ws"` und `"wss"` ConnectionManagers
- `arch/posix/eventloop_posix_ws.c` – Neuer WebSocket ConnectionManager (server-seitig)
- `arch/posix/eventloop_posix_ws.h` – Header für den WS ConnectionManager
- `include/open62541/plugin/eventloop.h` – Deklaration von `UA_ConnectionManager_new_WS`
- `CMakeLists.txt` – `eventloop_posix_ws.c` zur `UA_ENABLE_LWS` Build-Regel hinzugefügt

## Voraussetzungen

```bash
sudo apt-get install libwebsockets-dev build-essential cmake
```

## open62541 bauen (einmalig)

```bash
cd ../3rd-party/open62541
git checkout 1.5_ws
git submodule update --init --recursive
mkdir -p build && cd build
cmake .. -DUA_ENABLE_LWS=ON -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
```

## Server bauen

```bash
cd server-open62541
make
```

## Server starten

```bash
./bin/opcua-server
```

Der Server lauscht auf `ws://localhost:4444`.

## npm Script

```bash
npm run dev -w server-open62541
```

## Simulierte Daten

| Variable | Typ | Bereich | Simulationsverhalten |
|---|---|---|---|
| `ns=1;s=Temperature` | Double | 20 – 80 °C | Sinuswelle |
| `ns=1;s=Position` | Double | 0 – 1000 mm | Sägezahn |
| `ns=1;s=TrafficLight` | Int32 | 0 – 3 | Österreichische Ampel |
