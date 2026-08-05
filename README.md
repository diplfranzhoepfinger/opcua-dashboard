# OPC UA Dashboard

Browser-basiertes **OPC UA Dashboard**, das in Echtzeit Daten von einem OPC UA Server über WebSocket abruft und grafisch visualisiert.

![Demo](Aufzeichnung%202026-04-23%20200420.gif)


## Features

- **Temperatur-Gauge** – SVG-Halbkreis mit dynamischem Farbverlauf (20–80 °C)
- **Positions-Anzeige** – Horizontaler Balkengraph mit 2 Nachkommastellen (0–1000 mm)
- **Ampel-Visualisierung** – Österreichische Ampelschaltung (Grün → Gelb → Rot → Rot+Gelb → Grün)
- **Echtzeit-Daten** – OPC UA Subscriptions über WebSocket (kein Polling, Server pusht bei Wertänderung)
- **Stand-Alone HTML** – Der Client baut als eine einzige HTML-Datei, kein Webserver nötig
- **Konfigurierbarer Endpunkt** – WebSocket-URL direkt im UI eingebbar (praktisch bei wechselnden IPs)


## Technologie-Stack

### Client
- **Vue 3** (Composition API) + **TypeScript**
- **Vite** + **vite-plugin-singlefile** (Single-File HTML Build)
- **[demike/wsopcua](https://github.com/demike/wsopcua)** – OPC UA Client für den Browser

### Server (zwei alternative Implementierungen)

**Option A – Node.js Server (`server-node/`)**
- **node-opcua** – OPC UA Server Engine
- **ws** – WebSocket-Gateway (transparente Byte-Pipe zum OPC UA Server)

**Option B – C Server (`server-open62541/`)**
- **open62541** v1.5 – OPC UA Server Engine in C
- **libwebsockets** 4.3+ – Native WebSocket-Unterstützung direkt im Server, kein Gateway nötig
- Simulator direkt integriert


## Architektur

### Option A – Node.js

```
┌────────────────┐    ws://<IP>:4444    ┌──────────────────────────────────┐
│    Browser     │ ◄──────────────────► │  WS-Gateway   OPC UA Server      │
│ (HTML Datei)   │  OPC UA Binary/WS    │  (ws)    +    (node-opcua)       │
└────────────────┘                      │               + Simulator        │
                                        └──────────────────────────────────┘
```

### Option B – open62541

```
┌────────────────┐    ws://<IP>:4444    ┌──────────────────────────────────┐
│    Browser     │ ◄──────────────────► │  OPC UA Server mit nativem WS    │
│ (HTML Datei)   │  OPC UA Binary/WS    │  (open62541 + libwebsockets)     │
└────────────────┘                      │  + Simulator                     │
                                        └──────────────────────────────────┘
```


## Schnellstart

### Voraussetzungen

**Für den Node.js Server (Option A):**
- Node.js v18+

**Für den C Server (Option B):**
- `gcc`, `cmake`
- `libwebsockets` ≥ 4.3 (`apt install libwebsockets-dev`)
- `libssl-dev` (`apt install libssl-dev`)

### open62541 bauen (Option B)

```bash
# open62541 Submodul konfigurieren und bauen
./cmake-configure.sh
make open62541 -C open62541/build -j$(nproc)

# Test-Server bauen
make -C server-open62541

# Server starten
./run-server.sh
```

### Node.js Server (Option A)

```bash
npm install
npm run dev:server:node
```

### Client bauen

```bash
# Dashboard-Client (erzeugt client/dist/index.html)
npm run build -w client
```

`client/dist/index.html` kann direkt in Chrome geöffnet werden (Rechtsklick → Öffnen mit…).
Im UI die Server-IP eintragen (z.B. `ws://192.168.1.10:4444`) und **Verbinden** klicken.


## Simulierte Daten

| Node-ID | Typ | Bereich | Simulation |
|---|---|---|---|
| `ns=1;s=Temperature` | Double | 20–80 °C | Sinuswelle, Periode 10 s |
| `ns=1;s=Position` | Double | 0–1000 mm | Sägezahn, Periode 5 s |
| `ns=1;s=TrafficLight` | Int32 | 0–3 | Österreichische Schaltung |


## Projektstruktur

```
opcua-dashboard/
├── cmake-configure.sh          # open62541 CMake-Konfiguration (UA_ENABLE_LWS=ON usw.)
├── run-server.sh               # Startet den open62541 Test-Server
├── sbom-client.json            # CycloneDX 1.6 SBOM (Client)
├── open62541/                  # open62541 Submodul (diplfranzhoepfinger/open62541, Branch: master)
│   └── build/                  # CMake Build-Ausgabe (gitignored)
├── server-node/                # OPC UA Server + WS-Gateway (Node.js)
│   └── src/
│       ├── server.ts
│       ├── gateway.ts
│       ├── simulator.ts
│       └── index.ts
├── server-open62541/           # OPC UA Server mit nativem WebSocket (C)
│   ├── src/server.c
│   └── Makefile
└── client/                     # Vue 3 Dashboard (Browser)
    ├── index.html
    ├── vite.config.ts
    ├── dist/index.html         # Build-Ausgabe (Single-File HTML)
    └── src/
        ├── App.vue
        ├── main.ts
        ├── components/
        │   ├── TemperatureGauge.vue
        │   ├── PositionBar.vue
        │   └── TrafficLight.vue
        └── services/
            └── opcuaClient.ts
```


## Lizenz

Dieses Projekt verwendet ein **Dual-Licensing**:

- **Human Contributions** stehen unter der **MIT License**, Copyright (c) 2026 Franz Höpfinger.
- **AI-Generated Code** ist **Public Domain (CC0 1.0 Universal)**.

Details siehe [LICENSE](LICENSE).
