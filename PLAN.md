# OPC UA Dashboard Projekt – Plan

## Überblick

Dieses Projekt umfasst einen **Browser-basierten OPC UA Client**, der über WebSocket mit einem OPC UA Server kommuniziert und Daten in Echtzeit visualisiert.

*   **Client:** Reiner Browser-Client (HTML5), entwickelt mit **Vue 3 + Vite + TypeScript**.
*   **Kommunikation:** OPC UA over WebSocket mittels [`@wsopcua/wsopcua`](https://github.com/demike/wsopcua).
*   **Server:** Node.js OPC UA Server (`node-opcua`) mit integriertem **WebSocket-Gateway** und dynamischem **Datensimulator**.

---

## Architektur

```
opcua/
├── package.json              # Root-Config, npm workspaces
├── PLAN.md                   # Diese Datei
├── server/                   # OPC UA Server + WS-Gateway + Simulator
│   ├── src/
│   │   ├── server.ts         # node-opcua Server Setup (interner TCP)
│   │   ├── gateway.ts        # WebSocket-Server auf ws://localhost:4444
│   │   └── simulator.ts      # Daten-Loop für Simulation
│   ├── package.json
│   └── tsconfig.json
└── client/                   # Vue 3 Dashboard (Browser-Only)
    ├── src/
    │   ├── main.ts
    │   ├── App.vue
    │   ├── components/
    │   │   ├── TemperatureGauge.vue   # SVG-Halbkreis-Gauge
    │   │   ├── PositionBar.vue        # Balkengraph 0-1000mm
    │   │   └── TrafficLight.vue       # Österreichische Ampel (4 Zustände)
    │   └── services/
    │       └── opcuaClient.ts         # wsopcua Verbindung & Subscription
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## Server (`/server`)

### Technologie
*   **Node.js** mit TypeScript
*   **`node-opcua`**: OPC UA Server Engine (läuft intern auf TCP, z.B. `opc.tcp://localhost:26543`).
*   **`ws`**: WebSocket-Bibliothek für das Gateway.

### Funktionsweise
Der Server besteht aus drei eng gekoppelten Teilen:

1.  **OPC UA Server (`server.ts`)**: Ein `node-opcua`-Server, der im Hintergrund läuft.
2.  **WebSocket Gateway (`gateway.ts`)**: Ein WS-Server, der auf `ws://localhost:4444` lauscht. Er nimmt rohe OPC UA Binary-Frames vom Browser entgegen und leitet sie transparent an den internen `node-opcua`-Server weiter (und die Antworten zurück an den Browser). So kann der Browser direkt OPC UA over WS sprechen, ohne externen Proxy.
3.  **Simulator (`simulator.ts`)**: Ein `setInterval`-Loop, der die Werte der OPC UA Variablen zyklisch aktualisiert.

### Datenmodell (Namespace 1)
| NodeId | Datentyp | Beschreibung | Simulationsverhalten |
|---|---|---|---|
| `ns=1;s=Temperature` | `Double` | Temperatur in °C | Sinuswelle zwischen 20 und 80 °C |
| `ns=1;s=Position` | `Double` | Position in mm | **Sägezahn**: Steigt linear von 0 auf 1000, springt zurück auf 0 |
| `ns=1;s=TrafficLight` | `Int32` | Ampelzustand | **Österreichische Schaltung**: 0=Grün → 1=Gelb → 2=Rot → 3=Rot+Gelb → 0=Grün... |

---

## Client (`/client`)

### Technologie
*   **Vue 3** (Composition API)
*   **Vite** (Build-Tool & Dev-Server)
*   **TypeScript**
*   **`@wsopcua/wsopcua`**: OPC UA Client für den Browser

### Funktionsweise
Der Client ist eine reine Single-Page-Application (SPA), die im Browser läuft.

1.  **Verbindung (`services/opcuaClient.ts`)**: Baut über `@wsopcua/wsopcua` eine Verbindung zu `ws://localhost:4444` auf.
2.  **Subscription**: Erstellt eine einzige OPC UA Subscription mit drei Monitored Items (für Temperatur, Position, Ampel). So werden Daten per Push übertragen (**kein Polling**).
3.  **Komponenten**: Drei unabhängige Vue-Komponenten, die auf die `changed`-Events der Subscription reagieren und sich neu rendern.

### Visualisierungs-Widgets

#### 1. Temperatur-Gauge (`TemperatureGauge.vue`)
*   **Darstellung:** SVG-Halbkreis (180° oder 270°).
*   **Farbe:** Dynamischer Farbverlauf des Füllbogens (z.B. Blau bei 20°C → Grün → Gelb → Rot bei 80°C).
*   **Wert:** Digitaler Temperaturwert in der Mitte des Gauges.

#### 2. Positions-Bar (`PositionBar.vue`)
*   **Darstellung:** Horizontaler Balken, dessen Füllstand der Position entspricht.
*   **Skala:** Bereich 0 – 1000 mm.
*   **Wert:** Numerische Anzeige **mit 2 Nachkommastellen** (z.B. `842.35 mm`).

#### 3. Ampel (`TrafficLight.vue`)
*   **Darstellung:** Drei runde SVG-LEDs (oder CSS-Kreise) untereinander: Rot (oben), Gelb (mitte), Grün (unten).
*   **Zustände:**
    *   **Grün:** Nur die grüne LED leuchtet.
    *   **Gelb:** Nur die gelbe LED leuchtet.
    *   **Rot:** Nur die rote LED leuchtet.
    *   **Rot+Gelb:** **Beide LEDs (Rot und Gelb) leuchten gleichzeitig** (Österreichische Vorrangschaltung).
*   **Effekt:** Leuchtende LEDs haben einen sanften CSS-Glow (Schatten/Blur).

---

## Dev-Workflow

### Erstinstallation
Im Root-Verzeichnis des Projekts:
```bash
npm install
```
(Dies installiert Abhängigkeiten für Server und Client via npm workspaces.)

### Entwicklung starten
**Terminal 1 – Server starten:**
```bash
npm run dev:server
```
Startet den OPC UA Server, das WS-Gateway und den Simulator. Erreichbar unter `ws://localhost:4444`.

**Terminal 2 – Client starten:**
```bash
npm run dev:client
```
Startet den Vite Dev-Server und öffnet die App im Browser (normalerweise `http://localhost:5173`).

---

## Git Commit Strategie

Um eine saubere Entwicklungsgeschichte zu gewährleisten, werden automatisch Commits an folgenden Meilensteinen erstellt:

1.  **Server-Setup & Implementation** – Nach Fertigstellung des OPC UA Servers, WebSocket-Gateways und Simulators.
2.  **Client-Setup & Implementation** – Nach Fertigstellung des Vue 3 Dashboards mit allen Widgets und OPC UA Client-Logik.
3.  **Integration & Finalisierung** – Nach erfolgreichem End-to-End Test und Bugfixes.

---

## Ziele & Kriterien
*   [ ] Client ist **Browser-Only** (kein Node.js/Electron auf Client-Seite).
*   [ ] Daten werden **Echtzeit** über OPC UA Subscriptions übertragen.
*   [ ] Position wird als **Sägezahn** (0 → 1000 → 0) simuliert.
*   [ ] Ampel folgt der **österreichischen Schaltung** (Grün → Gelb → Rot → Rot+Gelb → Grün).
*   [ ] Kein externer Proxy oder Docker nötig.
