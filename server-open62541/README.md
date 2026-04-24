# OPC UA Server (open62541)

Alternative Server-Implementierung basierend auf [open62541](https://open62541.org/) (C) mit nativer WebSocket-Unterstützung über libwebsockets.

## Vorteile gegenüber Node.js Server

- **Kein separates Gateway** – open62541 spricht direkt WebSocket
- **Native Performance** – C-Code, kein Node.js Overhead
- **Einfacher Aufbau** – Ein einziges Binary

## Voraussetzungen

```bash
sudo apt-get install libwebsockets-dev build-essential cmake
```

## open62541 bauen (einmalig)

Das open62541-Repository liegt in `../3rd-party/open62541/`.

```bash
cd ../3rd-party/open62541
mkdir -p build && cd build
cmake .. -DUA_ENABLE_WEBSOCKET_SERVER=ON -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
```

### Patches anwenden (wichtig!)

open62541 v1.3.17 benötigt zwei Patches für libwebsockets 4.3+:

```bash
cd ../3rd-party/open62541
git apply ../../server-open62541/patches/0001-websocket-patches-for-lws-4.3.patch
```

Die Patches beheben:
1. `ws_ping_pong_interval` wurde in libwebsockets 4.3+ entfernt
2. VHost-Daten werden für das `opcua+uacp` Subprotokoll korrekt initialisiert

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
