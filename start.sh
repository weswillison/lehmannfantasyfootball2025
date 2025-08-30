#!/bin/bash

# Fantasy Football App Startup Script

echo "🏈 Starting Fantasy Football App..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 0
    else
        return 1
    fi
}

# Start backend server
echo "Starting backend server..."
if ! check_port 3001; then
    cd backend && npm start &
    BACKEND_PID=$!
    echo "Backend server started (PID: $BACKEND_PID)"
else
    echo "Backend server already running on port 3001"
fi

# Wait a moment for backend to initialize
sleep 3

# Start frontend server
echo "Starting frontend server..."
if ! check_port 3000; then
    cd frontend && npm start &
    FRONTEND_PID=$!
    echo "Frontend server started (PID: $FRONTEND_PID)"
else
    echo "Frontend server already running on port 3000"
fi

echo ""
echo "🎉 Fantasy Football App is starting up!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "API Health: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "Servers stopped. Goodbye! 👋"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait