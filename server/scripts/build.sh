#Building the client
#list all JS files, remove any directories '/', and grab those that end in .js
JS_FILES=$(find ./static/js-files/ -name *.js | grep -v "tests")
MAIN_FILE=./static/client.js
TEST_FILE=./static/tests.js

echo $JS_FILES

echo "CLIENT| Concatting "$JS_FILES
cat $JS_FILES > $MAIN_FILE

#Building the test suite
#list all JS files, remove any directories '/', and grab those that end in .js
JS_FILES=$(find ./static/js-files/ -name *.js | grep  "tests")
MAIN_FILE=./static/client.js

echo $JS_FILES

echo "TESTS| Concatting "$JS_FILES
cat $JS_FILES > $TEST_FILE
