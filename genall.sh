#!/bin/bash -xe
FIRST_DATE=$1
LAST_DATE=`date '+%Y-%m-%d'`
TODAY=`date '+%Y%m%d'`

echo "${FIRST_DATE} => ${LAST_DATE}"
node get.js
node get_fitbit.js --first-date ${FIRST_DATE} --last-date ${LAST_DATE} > dst/fitbit_sleep_${TODAY}.json
./serve.sh
