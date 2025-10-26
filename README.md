# 🚉 Departures

Raspberry Pi train departures board for LED matrix display. Displays the next 4 departures, along with their status.

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

### Build and run manually

```bash
npm run build
sudo $(which node) ./dist/index.js
```

### Running on startup

```bash
# Important to use the sudo crontab. Using the non-sudo crontab and pointing it to a script
# that launches the program using sudo results in 2 instances being launched ¯\_(ツ)_/¯
sudo crontab -e
# Add this line to the crontab
@reboot /path/to/repo/pi_start.sh
```

To check and kill processes started by the cron

```bash
# See running processes
ps aux | grep node
# Kill it
sudo pkill -f "/path/to/repo/dist/index.js"
```
