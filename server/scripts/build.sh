#!/bin/bash
# Automate the necessary
# Grouping all of our distributed JS into one client file


MAIN_FILE="./static/client.js"
TEST_FILE="./static/tests.js"
STATIC_DIR="./static/"
JS_FILES_DIR="./js-files/"

function append_files(){
	local SOURCE="$1"
	local TARGET="$2"

	if [[ -f "$TARGET" ]];
	then
		echo "$SOURCE" | while read thisFile;
		do
		#SAY WHAT YOU DO
		echo "$thisFile >> $TARGET"
		#THEN DO IT
		cat "$thisFile" >> "$TARGET"
		done
	
	echo "DONE for $TARGET"
	fi
}

build_static_files() {
	echo "Creating static files."
	touch "$MAIN_FILE";
	touch "$TEST_FILE";		
}

# Ensures we have empty static files to cat into 
function prepare_static_files() {
	if [[ -f "$MAIN_FILE" && -f "$TEST_FILE" ]];
	then
		local MAIN_COUNT=$(wc -l < "$MAIN_FILE")
		local TEST_COUNT=$(wc -l < "$TEST_FILE")

		if [[ "$MAIN_COUNT" -gt 0 || "$TEST_COUNT" -gt 0 ]];
		then
			echo "Non-empty static files! ($MAIN_COUNT, $TEST_COUNT)"
			build_static_files;
		fi
	else
		build_static_files;
	fi
}

# MAIN Function
function begin(){
	# Simple find, for files, ending in .js, without out test files
	JS_FILES=$(find ./js-files/ -type f -name *.js)

	SOURCE_ONLY_FILES=$(echo "$JS_FILES" | grep -v "tests")
	TEST_FILES=$(echo "$JS_FILES" | grep "tests")

	echo "CLIENT| Concatting Source files.."
	append_files "$SOURCE_ONLY_FILES" "$MAIN_FILE"

	echo "CLIENT| Concatting Tests.. $TEST_FILES"
	append_files "$TEST_FILES" "$TEST_FILE"
}


# MAIN 
#Check for directories
if [[ -d "$STATIC_DIR" && -d "$JS_FILES_DIR" ]];
then
	prepare_static_files;
	begin;
else
	echo "Could not find ./static/ and/or ./js-files/ dir, please ensure running dir is correct."
fi	
