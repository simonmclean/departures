# 🚉 Departures

Raspberry Pi train departures board for LED matrix display.

Designed to work for a single station with 2 platforms. Displays the next 4 departures, along with their status.

Minimal dependancies.

## Running on the Pi

### Prerequisites

- Node 24 is installed
- `.env` file exists in the root with the following environment variables

```bash
TFL_API_KEY
LINE_ID
STOP_POINT_ID
```

### Build and run

```bash
npm run dev
sudo $(which node) ./dist/index.js
```
