#!/bin/bash -xe
TODAY=`date '+%Y%m%d'`
node gen.js -s --fitbit-sleep-json dst/fitbit_sleep_${TODAY}.json --slack-data dst/slack_${TODAY}.txt
