#list all JS files, remove any directories '/', and grab those that end in .js
JS_FILES=$(find ./static/js-files/ -name *.js | grep -v "tests")
MAIN_FILE=./static/client.js

echo $JS_FILES

echo "Concatting "$JS_FILES
cat $JS_FILES > $MAIN_FILE
