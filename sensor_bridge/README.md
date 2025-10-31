# Sensor Bridge
아두이노(체온/심박) 시리얼 데이터를 WebSocket(로컬)으로 중계합니다.

## 사용법
```bat
set SERIAL_PORT=COM4
set SERIAL_BAUD=115200
..\scripts\run-sensor-bridge.bat
```
아두이노는 한 줄에 하나의 JSON을 출력하도록 스케치하세요:
```
{"temperature":36.8,"heartRate":72}
```
