#!/bin/bash


# This script generates .json files from .po translation files
# these json files are used by the frontend to load translations

set -e

export NODE_NO_WARNINGS=1

for file in $( find ../zobi/translations/** -name '*.po' );
do
  extension=${file##*.}
  filename="${file%.*}"
  if [ $extension == "po" ]
  then
    echo "po2json --domain zobi --format jed1.x $file $filename.json"
    po2json --domain zobi --format jed1.x --fuzzy $file $filename.json
    prettier --write $filename.json
  fi
done
