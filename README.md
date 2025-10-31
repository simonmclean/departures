# 🚉 Departures

Raspberry Pi train departures board for LED matrix display. Displays the next 4 departures, along with their status.

Only dependency is [hzeller/rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix) which is used to control the LED display.

## Running on the Pi

### Prerequisites

- Node 24 is installed via [nvm](https://github.com/nvm-sh/nvm) (`nvm` is assumed in the `pi_start.sh` script)
- `config.json` file exists in the root with the following schema

```jsonc
{
  "tflApiKey": "string",
  "lineId": "string",
  "stopPointId": "string",
  // Optional values below
  "dataFetchIntervalSeconds": "number", // default 15
  "activeHoursFrom": "number", // default 1
  "activeHoursTo": "number", // default 8
}
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
