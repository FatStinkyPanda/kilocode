#!/bin/bash

# Unix/Linux/macOS shell script wrapper for rebuild-and-install.js

echo "Starting Kilo Code rebuild and reinstall..."
echo ""

node rebuild-and-install.js

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "Script failed with error code $EXIT_CODE"
    exit $EXIT_CODE
fi

echo ""
echo "Done!"
