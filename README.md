# 🚉 Departures

Raspberry Pi train departures board for LED matrix display

## Running on the Pi

### Prerequisites

- Node 24 is installed
- Onboard audio is disabled

```bash
sudo vi /boot/firmware/config.txt
# Set or update value
dtparam=audio=off
```

### Build and run

```bash
npm run dev
sudo $(which node) ./dist/index.js
```
