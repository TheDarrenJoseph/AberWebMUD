
#!/bin/bash

PIDFILE="/tmp/aberwebmud.pid"

RUNNING=false

function server_status() {
	if [ -s $PIDFILE ] 
	then
		PID=$(<"$PIDFILE")
		PID_COUNT=$(ps --no-heading -p "$PID" | wc -l)
		echo "PID Count: $PID_COUNT"
		RUNNING=$(( "$PID_COUNT" >= 0 ))
		test "$RUNNING" && echo "Running as PID: $PID" || echo "Not running.."

	else
		echo "No pidfile at $PIDFILE, server not running?"
	fi
	
}

case $1 in
	start)
		if [ -s $PIDFILE ] 
		then
			echo "Server already running with PID: $(cat $PIDFILE)"
		else
			source locenv/bin/activate
			python main.py &> aberwebmud.log &
			echo "$!" > "$PIDFILE"
		fi
		;;
	stop)
		if [ -s $PIDFILE ] 
		then
			cat "$PIDFILE" | xargs kill --verbose
			rm "$PIDFILE"
		else
			echo "No pidfile at $PIDFILE, server not running?"
		fi
		;;
	status)
		server_status
		;;
esac
