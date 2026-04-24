# OPC UA Dashboard

Ein browser-basiertes **OPC UA Dashboard**, das in Echtzeit Daten von einem OPC UA Server über WebSocket abruft und grafisch visualisiert.

![Demo](Aufzeichnung%202026-04-23%20200420.gif)


## Features

- **Temperatur-Gauge** – SVG-Halbkreis mit dynamischem Farbverlauf (20–80 °C)
- **Positions-Anzeige** – Horizontaler Balkengraph mit 2 Nachkommastellen (0–1000 mm)
- **Ampel-Visualisierung** – Österreichische Ampelschaltung (Grün → Gelb → Rot → Rot+Gelb → Grün)
- **Echtzeit-Daten** – OPC UA Subscriptions über WebSocket (kein Polling!)
- **Stand-Alone HTML** – Der Client kann als eine einzige HTML-Datei gebaut und ohne Webserver direkt in Chrome geöffnet werden.
- **Konfigurierbarer Endpunkt** – Die WebSocket-URL kann direkt im UI eingegeben werden (praktisch bei wechselnden IPs).

## Technologie-Stack

### Client
- **Vue 3** (Composition API)
- **Vite** mit **vite-plugin-singlefile** (für den Stand-Alone Build)
- **TypeScript**
- **[demike/wsopcua](https://github.com/demike/wsopcua)** – OPC UA Client für den Browser

### Server (zwei alternative Implementierungen)

**Option A – Node.js Server (`server-node/`)**
- **Node.js** + TypeScript
- **[node-opcua](https://github.com/node-opcua/node-opcua)** – OPC UA Server Engine
- **ws** – WebSocket-Bibliothek für das Gateway (hört auf `0.0.0.0`)
- **tsx** – TypeScript Execution

**Option B – C Server (`server-open62541/`)**
- **open62541** v1.3+ – OPC UA Server Engine in C
- **libwebsockets** – Native WebSocket-Unterstützung (kein separates Gateway!)
- **Simulator** – Direkt im Server-Prozess integriert

## Architektur

### Option A – Node.js Server

```
┌────────────────────┐      ws://<IP>:4444       ┌─────────────────────────────────────┐
│      Browser       │  ◄─────────────────────►  │  OPC UA Server  +  WS Gateway       │
│ (index.html Datei) │   OPC UA Binary over WS   │  (node-opcua)     (ws)              │
└────────────────────┘                           │                    + Simulator      │
                                                 └─────────────────────────────────────┘
```

Der Server besteht aus drei Teilen:
1. **OPC UA Server** – Läuft intern auf TCP Port 26543
2. **WebSocket Gateway** – Transparente Byte-Pipe von Port 4444 zum OPC UA Server
3. **Simulator** – Ändert zyklisch Temperatur, Position und Ampelzustand

### Option B – open62541 C Server

```
┌────────────────────┐      ws://<IP>:4444       ┌─────────────────────────────────────┐
│      Browser       │  ◄─────────────────────►  │  OPC UA Server mit nativem WS       │
│ (index.html Datei) │   OPC UA Binary over WS   │  (open62541 + libwebsockets)        │
└────────────────────┘                           │                    + Simulator      │
                                                 └─────────────────────────────────────┘
```

Der open62541-Server nutzt den integrierten `UA_ServerNetworkLayerWS`, um direkt auf WebSocket-Verbindungen zu lauschen – kein separates Gateway nötig.

## Schnellstart

### Voraussetzungen
- [Node.js](https://nodejs.org/) (v18+)
- npm (im Lieferumfang von Node.js enthalten)

### Installation

```bash
# Repository klonen
git clone https://github.com/diplfranzhoepfinger/opcua-dashboard.git
cd opcua-dashboard

# Abhängigkeiten installieren (Server + Client)
npm install
```

### Entwicklung starten

**Terminal 1 – Server starten (eine der beiden Optionen):**

```bash
# Option A – Node.js Server
npm run dev:server:node

# Option B – open62541 C Server (vorher bauen: cd server-open62541 && make)
npm run dev:server:open62541
```

**Terminal 2 – Client starten:**
```bash
npm run dev:client
```
Startet den Vite Dev-Server. Das Dashboard ist unter `http://localhost:5173` erreichbar.

### Stand-Alone Build (Einzelne HTML Datei)

```bash
# Client bauen (erzeugt eine einzige Datei)
npm run build -w client

# Die Datei liegt in client/dist/index.html
```
Öffne `client/dist/index.html` direkt mit Chrome (Rechtsklick -> Öffnen mit...).
Gib oben im Dashboard die IP-Adresse deines Servers ein (z.B. `ws://192.168.1.10:4444`) und klicke auf **Connect**.

## Simulierte Daten

| Variable | Typ | Bereich | Simulationsverhalten |
|---|---|---|---|
| `ns=1;s=Temperature` | Double | 20 – 80 °C | Sinuswelle |
| `ns=1;s=Position` | Double | 0 – 1000 mm | Sägezahn (linear aufsteigend, dann Sprung auf 0) |
| `ns=1;s=TrafficLight` | Int32 | 0 – 3 | Österreichische Schaltung: Grün → Gelb → Rot → Rot+Gelb → Grün |

## Projektstruktur

```
opcua-dashboard/
├── server-node/            # OPC UA Server + WS-Gateway + Simulator (Node.js)
│   ├── src/
│   │   ├── server.ts       # node-opcua Server Setup
│   │   ├── gateway.ts      # WebSocket → TCP Bridge
│   │   ├── simulator.ts    # Daten-Loop
│   │   └── index.ts        # Entry Point
│   ├── package.json
│   └── tsconfig.json
├── server-open62541/       # OPC UA Server mit nativem WS (C/open62541)
│   ├── src/
│   │   └── server.c        # open62541 Server + Simulator
│   ├── Makefile
│   └── package.json
├── client/                 # Vue 3 Dashboard (Browser-Only)
│   ├── src/
│   │   ├── components/
│   │   │   ├── TemperatureGauge.vue
│   │   │   ├── PositionBar.vue
│   │   │   └── TrafficLight.vue
│   │   ├── services/
│   │   │   └── opcuaClient.ts   # wsopcua Verbindung & Subscriptions
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── package.json            # Root, npm workspaces
└── README.md
```

## Git Commit Strategie

Um eine saubere Entwicklungsgeschichte zu gewährleisten, werden automatisch Commits an folgenden Meilensteinen erstellt:

1. **Server-Setup & Implementation** – Nach Fertigstellung des OPC UA Servers, WebSocket-Gateways und Simulators.
2. **Client-Setup & Implementation** – Nach Fertigstellung des Vue 3 Dashboards mit allen Widgets und OPC UA Client-Logik.
3. **Integration & Finalisierung** – Nach erfolgreichem End-to-End Test und Bugfixes.

## Lizenz

Dieses Projekt verwendet ein **Dual-Licensing**:

- **Human Contributions** (Planung, Architektur, Konfiguration, manuelle Edits) stehen unter der **MIT License**, Copyright (c) 2026 Franz Höpfinger.
- **AI-Generated Code** (vollständig durch Kimi K2.6 generiert) ist **Public Domain (CC0 1.0 Universal)**.

Details siehe [LICENSE](LICENSE).
