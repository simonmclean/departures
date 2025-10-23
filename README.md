# 🚉 Raspberry Pi Train Departures Board for LED Matrix Display

## Running on the Pi

### Prerequisites

- Node 24 is installed
- Onboard audio is disabled

```
sudo vi /boot/firmware/config.txt
dtparam=audio=off
```

### Build and run

```
npm run dev
sudo $(which node) ./dist/index.js
```
