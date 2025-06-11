#!/bin/bash

echo "🚀 Starting Monaco Java Editor..."

# Function to handle cleanup on script exit
cleanup() {
    echo -e "\n\n🛑 Shutting down servers..."
    # Kill all background jobs started by this script
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

# Check if Java is installed
echo "☕ Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed or not in PATH"
    echo "Please install Java (OpenJDK 11+ recommended) and try again"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1)
echo "✅ Java found: $JAVA_VERSION"

# Install dependencies if needed
echo -e "\n🎨 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🚀 Starting Monaco Java Editor (port 5173)..."
npm run dev &
FRONTEND_PID=$!

# Wait for server to start
sleep 3

echo -e "\n✅ Monaco Java Editor started successfully!"
echo "📝 Editor available at: http://localhost:5173"
echo -e "\nPress Ctrl+C to stop the server"

# Wait for background jobs to finish
wait 