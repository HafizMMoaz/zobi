#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"
LICENSE_TMP=$(mktemp)
cat <<'EOF'> "$LICENSE_TMP"

EOF

cd $ROOT_DIR
pybabel extract \
  -F zobi/translations/babel.cfg \
  -o zobi/translations/messages.pot \
  --no-location \
  --sort-output \
  --copyright-holder=Zobi \
  --project=Zobi \
  -k _ -k __ -k t -k tn:1,2 -k tct .

# Normalize .pot file
msgcat --sort-by-msgid --no-wrap --no-location zobi/translations/messages.pot -o zobi/translations/messages.pot

cat $LICENSE_TMP zobi/translations/messages.pot > messages.pot.tmp \
  && mv messages.pot.tmp zobi/translations/messages.pot

pybabel update \
  -i zobi/translations/messages.pot \
  -d zobi/translations \
  --ignore-obsolete

# Chop off last blankline from po/pot files, see https://github.com/python-babel/babel/issues/799
for file in $( find zobi/translations/** );
do
  extension=${file##*.}
  filename="${file%.*}"
  if [ $extension == "po" ] || [ $extension == "pot" ]
  then
    mv $file $file.tmp
    sed "$ d" $file.tmp > $file
    rm $file.tmp
  fi
done

cd $CURRENT_DIR
