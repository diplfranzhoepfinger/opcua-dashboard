# OPC UA Dashboard

Ein browser-basiertes **OPC UA Dashboard**, das in Echtzeit Daten von einem OPC UA Server über WebSocket abruft und grafisch visualisiert.

![Demo](Aufzeichnung%202026-04-23%20200420.gif)

## Features

- **Temperatur-Gauge** – SVG-Halbkreis mit dynamischem Farbverlauf (20–80 °C)
- **Positions-Anzeige** – Horizontaler Balkengraph mit 2 Nachkommastellen (0–1000 mm)
- **Ampel-Visualisierung** – Österreichische Ampelschaltung (Grün → Gelb → Rot → Rot+Gelb → Grün)
- **Echtzeit-Daten** – OPC UA Subscriptions über WebSocket (kein Polling!)
- **Browser-Only** – Der Client läuft ausschließlich im Browser, kein Node.js/Electron nötig

## Technologie-Stack

### Client
- **Vue 3** (Composition API)
- **Vite** – Ultra-schneller Dev-Server & Build-Tool
- **TypeScript**
- **[@wsopcua/wsopcua](https://github.com/demike/wsopcua)** – OPC UA Client für den Browser

### Server
- **Node.js** + TypeScript
- **[node-opcua](https://github.com/node-opcua/node-opcua)** – OPC UA Server Engine
- **ws** – WebSocket-Bibliothek für das Gateway
- **tsx** – TypeScript Execution

## Architektur

```
┌─────────────┐         ws://localhost:4444         ┌─────────────────────────────────────┐
│   Browser   │  ◄────────────────────────────────►  │  OPC UA Server  +  WS Gateway       │
│  (Vue 3)    │      OPC UA Binary over WebSocket    │  (node-opcua)     (ws)              │
└─────────────┘                                      │                    + Simulator      │
                                                     └─────────────────────────────────────┘
```

Der Server besteht aus drei Teilen:
1. **OPC UA Server** – Läuft intern auf TCP Port 26543
2. **WebSocket Gateway** – Transparente Byte-Pipe von `ws://localhost:4444` zum OPC UA Server
3. **Simulator** – Ändert zyklisch Temperatur, Position und Ampelzustand

## Schnellstart

### Voraussetzungen
- [Node.js](https://nodejs.org/) (v18+)
- npm (im Lieferumfang von Node.js enthalten)

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd opcua-dashboard

# Abhängigkeiten installieren (Server + Client)
npm install
```

### Entwicklung starten

**Terminal 1 – Server starten:**
```bash
npm run dev:server
```
Startet den OPC UA Server, das WS-Gateway und den Simulator.

**Terminal 2 – Client starten:**
```bash
npm run dev:client
```
Startet den Vite Dev-Server und öffnet das Dashboard im Browser.

Das Dashboard ist dann unter `http://localhost:5173` erreichbar.

### Produktions-Build

```bash
# Client bauen
npm run build -w client

# Ergebnis liegt in client/dist/ und kann statisch gehostet werden
```

## Simulierte Daten

| Variable | Typ | Bereich | Simulationsverhalten |
|---|---|---|---|
| `ns=1;s=Temperature` | Double | 20 – 80 °C | Sinuswelle |
| `ns=1;s=Position` | Double | 0 – 1000 mm | Sägezahn (linear aufsteigend, dann Sprung auf 0) |
| `ns=1;s=TrafficLight` | Int32 | 0 – 3 | Österreichische Schaltung: Grün → Gelb → Rot → Rot+Gelb → Grün |

## Projektstruktur

```
opcua-dashboard/
├── server/                 # OPC UA Server + WS-Gateway + Simulator
│   ├── src/
│   │   ├── server.ts       # node-opcua Server Setup
│   │   ├── gateway.ts      # WebSocket → TCP Bridge
│   │   ├── simulator.ts    # Daten-Loop
│   │   └── index.ts        # Entry Point
│   ├── package.json
│   └── tsconfig.json
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

MIT
