# Contributing to OPC UA Dashboard

Danke für dein Interesse an diesem Projekt! Wir freuen uns über Beiträge jeder Art.

## Wie kann ich beitragen?

### Fehler melden (Bug Reports)
- Prüfe zuerst, ob der Fehler bereits in den [Issues](../../issues) gemeldet wurde.
- Erstelle ein neues Issue mit einem klaren Titel und einer detaillierten Beschreibung.
- Füge Schritte zur Reproduktion, erwartetes Verhalten und tatsächliches Verhalten hinzu.
- Nenne deine Umgebung (Betriebssystem, Browser, Node.js-Version).

### Funktionswünsche (Feature Requests)
- Erstelle ein Issue mit dem Label `enhancement`.
- Beschreibe das gewünschte Feature und den Anwendungsfall.

### Code beisteuern (Pull Requests)
1. Forke das Repository.
2. Erstelle einen Feature-Branch (`git checkout -b feature/MeinFeature`).
3. Committe deine Änderungen (`git commit -m 'feat: add amazing feature'`).
4. Pushe den Branch (`git push origin feature/MeinFeature`).
5. Erstelle einen Pull Request.

## Commit-Konventionen

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` – Neue Funktion
- `fix:` – Fehlerbehebung
- `docs:` – Dokumentation
- `style:` – Formatierung (keine Code-Änderung)
- `refactor:` – Code-Refactoring
- `test:` – Tests
- `chore:` – Wartung/Build-Änderungen

## Code-Style

- **TypeScript**: Strikter Modus aktiviert.
- **Vue 3**: Composition API bevorzugt.
- **Formatierung**: Konsistente Einrückung (2 Leerzeichen).

## Entwicklungs-Workflow

```bash
# Abhängigkeiten installieren
npm install

# Server starten (Terminal 1)
npm run dev:server

# Client starten (Terminal 2)
npm run dev:client
```

## Fragen?

Bei Fragen erstelle einfach ein Issue oder kontaktiere die Maintainer.

Vielen Dank! 🚀
