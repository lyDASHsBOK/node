nohup forever -p . -l ./logs/http-server-access.log -e ./logs/http-server-error.log -a start ./Wifi-HTTP-Server/app.js > ./logs/forever.log  >&1 &
echo "Node server Wifi-HTTP-Server started..."

nohup forever -p . -l ./logs/chat-access.log -e ./logs/caht-error.log -a start ./Wifi-WS-Server/app.js > ./logs/forever.log >&1 &
echo "Node server Wifi-WS-Server started..."
