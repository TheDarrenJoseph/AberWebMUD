
#!/bin/bash

PIDFILE="/tmp/aberwebmud.pid"

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
		else
			echo "No pidfile at $PIDFILE, server not running?"
		fi
		;;
	status)
		if [ -s $PIDFILE ] 
		then
			PID=$(<"$PIDFILE")
			echo "Server running with PID: $PID"
		else
			echo "No pidfile at $PIDFILE, server not running?"
		fi
		;;
esac
