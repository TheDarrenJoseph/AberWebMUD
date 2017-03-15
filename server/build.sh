JS_FILES=$(ls ./static/js-files/*.js)
MAIN_FILE=./static/client.js

echo "Concatting "$JS_FILES

cat $JS_FILES > $MAIN_FILE
