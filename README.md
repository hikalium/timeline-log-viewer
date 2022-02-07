# timeline-log-viewer

![screen shot](./docs/screenshot.png)

Log viewer in chronological way (Slack + Fitbit)

Add `.env` file with API keys like this:
```
SLACK_TOKEN=xoxp-...
FITBIT_TOKEN=eyJ...
FITBIT_USER=...
```

Get data + serve the result:
```
./genall.sh 2022-01-01
```

Open http://localhost:4000/ to see your sleep timeline!

