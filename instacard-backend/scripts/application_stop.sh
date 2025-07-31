#!/bin/bash

# Check if any Node processes are running
if pgrep node >/dev/null 2>&1; then
  echo "Stopping Node processes"
  # Stop any running Node processes
  pkill node
else
  echo "No Node processes running"
fi
