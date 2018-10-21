#!/bin/bash

function check_return () {
if [[ $2 != 0 ]]; then
	echo "$1 returned non-zero"
	exit 1;
fi
}


cd js-files
#npm install
#check_return "npm install" $?
npm run build
check_return "client build" $?

cd ..
python main.py
