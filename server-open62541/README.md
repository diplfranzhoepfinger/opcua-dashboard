# OPC UA Server (open62541)

Alternative Server-Implementierung basierend auf [open62541](https://open62541.org/) (C) mit nativer WebSocket-Unterstützung über libwebsockets.

## Vorteile gegenüber Node.js Server

- **Kein separates Gateway** – open62541 spricht direkt WebSocket
- **Native Performance** – C-Code, kein Node.js Overhead
- **Einfacher Aufbau** – Ein einziges Binary

## Bekannte Probleme & Lösungen

### 1. `UA_Server_addRepeatedCallback` + libwebsockets = Timer funktioniert nicht

**Problem:** In open62541 v1.3 mit libwebsockets 4.3 blockiert `lws_service()` den Server-Loop. Timer-Callbacks (z.B. für `UA_Server_addRepeatedCallback`) werden daher **nie** aufgerufen.

**Lösung:** Kein Timer-Callback mehr verwenden. Stattdessen läuft der Simulator direkt in der Haupt-Event-Loop:

```c
while(running) {
    UA_Server_run_iterate(server, 0);  // non-blocking
    // ... Werte berechnen ...
    UA_Server_writeValue(server, nodeId, value);  // direkt schreiben
    usleep(100000);  // 100ms Pacing
}
```

Siehe `src/server.c` für die vollständige Implementierung.

### 2. `UA_ServerConfig_setBasics` erzeugt keine brauchbaren Endpoints

**Problem:** `setBasics()` initialisiert nur das Minimum. Ohne korrekte Endpoints verweigert der wsopcua-Client die Verbindung mit "Cannot find ANONYMOUS user token policy".

**Lösung:** `UA_ServerConfig_setDefault()` verwenden (legt TCP-Layer + Endpoints an), dann den Default-Netzwerk-Layer durch den WS-Layer ersetzen:

```c
UA_ServerConfig_setDefault(config);
// Alten TCP-Layer entfernen
if(config->networkLayersSize > 0) {
    UA_free(config->networkLayers);
    config->networkLayers = NULL;
    config->networkLayersSize = 0;
}
// Neuen WS-Layer hinzufügen
UA_ServerConfig_addNetworkLayerWS(config, 4444, 0, 0, NULL, NULL);
```

### 3. Patches für libwebsockets 4.3+

open62541 v1.3.17 benötigt zwei Patches:

```bash
cd ../3rd-party/open62541
git apply ../../server-open62541/patches/0001-websocket-patches-for-lws-4.3.patch
```

1. **`ws_ping_pong_interval`** wurde in libwebsockets 4.3+ entfernt (führt zu Build-Fehler)
2. **VHost-Daten** müssen für das `opcua+uacp` Subprotokoll initialisiert werden (sonst Segfault beim ersten Connect)

## Voraussetzungen

```bash
sudo apt-get install libwebsockets-dev build-essential cmake
```

## open62541 bauen (einmalig)

```bash
cd ../3rd-party/open62541
mkdir -p build && cd build
cmake .. -DUA_ENABLE_WEBSOCKET_SERVER=ON -DCMAKE_BUILD_TYPE=Release
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
