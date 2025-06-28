#include <ESP8266WiFi.h>
#include <espnow.h>
#include <SoftwareSerial.h>
#define TINY_GSM_MODEM_SIM800
#include <TinyGsmClient.h>
#define SENSOR_ENABLE D6  // Active LOW to enable the sensor
#define Buzzer_Signal D5
// ====== SIM800L Configuration ======
#define MODEM_RX 5  // D2 on NodeMCU
#define MODEM_TX 4  // D1 on NodeMCU

SoftwareSerial sim800(MODEM_RX, MODEM_TX);
TinyGsm modem(sim800);
TinyGsmClient client(modem);

// ====== APN and Server Config ======
const char apn[] = "internet.vodafone.net";  // APN
const char user[] = "";                      // Usually blank
const char pass[] = "";                      // Usually blank

const char* server = "";  // Server address
const int port = 80;                               // HTTP port
const char* resource = "/esp/reading";             // API endpoint
int res;
uint8_t transMac[] = { 0x00,0x00,0x00,0x00,0x00,0x00 }; // mac address

struct SensorData {
  short id;
  float temperature;
};

unsigned long timerReq, timerReading;
float arr[3];
bool flag[2] = { 0, 0 };
short i = 0;
bool newDataReceived = false;

float avg() {
  return (arr[0] + arr[1] + arr[2]) / 3.0;
}

float reading() {
  float distance_cm;

  Serial.flush();

  while (1) {

    if (Serial.available() >= 4) {  // Ensure full data packet
      uint8_t header = Serial.read();
      if (header != 255)
        continue;
      uint16_t data1 = Serial.read();
      uint16_t data2 = Serial.read();
      uint16_t checksum = Serial.read();

      if (checksum + 1 == (data1 + data2) & 0xFF) {  // Validate checksum
        distance_cm = ((data1 << 8) | data2) / 10.0;
        flag[0] = false;
        return distance_cm;
      } else {  //PULSE FOR THE BUZZER
        flag[0] = true;
        // digitalWrite(SENSOR_ENABLE, HIGH);  // Disable sensor
        return avg();
      }
    }
  }
}



void sendFlag(uint8_t flag) {  // flag to send - 1 = reqdata , 2 =? alarm , 0 =? stop alarm
  esp_now_send(transMac, &flag, sizeof(flag));
}

SensorData receivedData;

void OnDataRecv(uint8_t* mac_addr, uint8_t* incomingData, uint8_t len) {
  memcpy(&receivedData, incomingData, sizeof(receivedData));
  Serial.print("Received Temperature: ");
  Serial.println(receivedData.temperature);
  newDataReceived = true;
}

void OnDataSent(uint8_t* mac_addr, uint8_t sendStatus) {
  Serial.print("Delivery Status: ");
  Serial.println(sendStatus == 0 ? "Success" : "Fail");
}

void sendToAPI(SensorData sensor1, SensorData sensor2) {
  String jsonData =
    "{\"data\":[{\"sensorID\":" + String(sensor1.id) + ",\"value\":" + String(sensor1.temperature) + "},{\"sensorID\":" + String(sensor2.id) + ",\"value\":" + String(sensor2.temperature) + "}]}";
  Serial.println("Initializing modem...");
  modem.restart();

  // Wait for network
  Serial.print("Waiting for network...");
  Serial.print("signal Quality: ");
  Serial.println(modem.getSignalQuality());
  if (!modem.waitForNetwork()) {
    Serial.println(" failed");
    return;
  }
  Serial.println(" success");

  // Connect to GPRS
  Serial.print("Connecting to GPRS...");
  if (!modem.gprsConnect(apn, user, pass)) {
    Serial.println(" failed");
    return;
  }
  Serial.println(" success");

  // Connect to server
  Serial.print("Connecting to ");
  Serial.print(server);
  if (!client.connect(server, port)) {
    Serial.println(" failed");
    return;
  }
  Serial.println(" success");

  // Send HTTP POST Request
  Serial.println("Sending HTTP POST request...");
  client.print("POST ");
  client.print(resource);
  client.print(" HTTP/1.1\r\n");
  client.print("Host: ");
  client.print(server);
  client.print("\r\n");
  client.print("User-Agent: ESP8266SIM800\r\n");
  client.print("Connection: close\r\n");
  client.print("Content-Type: application/json\r\n");
  client.print("Content-Length: ");
  client.print(jsonData.length());
  client.print("\r\n\r\n");  // End headers section
  client.print(jsonData);    // Send POST data in the body

  // Await response
  Serial.println("Awaiting response:");
    int state = 0;
  res = 0;
  while (client.connected()) {
    delay(500);
    while (client.available()) {
      char c = client.read();
      switch (state){
        case 0:
          state = (c=='1'?1:0);
          break;
        case 1:
          state = (c=='.'?2:0);
          break;
        case 2:
          state = (c=='1'?3:0);
          break;
        case 3:
          state = (c==' '?4:0);
          break;
        case 4:
          state = 5;
          res = c - '0';
          break;
        case 5:
          state = 6;
          res = res*10 + c - '0';
          break;
        case 6:
          state = 0;
          res = res*10 + c - '0';
          break;
        default:
          state = 0;
          break;
      }
          
      Serial.write(c);
    }
  }


  // Disconnect
  client.stop();
  modem.gprsDisconnect();
  Serial.println("\nDisconnected.");
}

void setup() {
  Serial.begin(9600);
  sim800.begin(9600);
  Serial.println("\nstart");
  pinMode(SENSOR_ENABLE, OUTPUT);
  digitalWrite(SENSOR_ENABLE, LOW);  // Enable sensor
  WiFi.mode(WIFI_STA);
  if (esp_now_init() != 0) {
    Serial.println("ESP-NOW Init Failed!");
    return;
  }
  Serial.println("ESP-NOW Init on");

  esp_now_set_self_role(ESP_NOW_ROLE_COMBO);
  esp_now_register_recv_cb(OnDataRecv);
  esp_now_register_send_cb(OnDataSent);
  esp_now_add_peer(transMac, ESP_NOW_ROLE_COMBO, 1, NULL, 0);
  arr[0] = reading();
  arr[1] = reading();
  arr[2] = reading();
  timerReq = millis();
  timerReading = millis();
  pinMode(Buzzer_Signal, OUTPUT);
  digitalWrite(Buzzer_Signal, LOW);

  Serial.println("end setup");
}

void loop() {
  if (flag[0] || flag[1]) {
    digitalWrite(Buzzer_Signal, HIGH);
    delay(100);
    flag[0] = flag[1] = false;
  } else {
    digitalWrite(Buzzer_Signal, LOW);
  }
  if (millis() - timerReading > 10000) {
    arr[i] = reading();
    Serial.println("read");
    i = (i + 1) % 3;
    timerReading = millis();
  }
  if (millis() - timerReq > 30000) {
    Serial.println("req");
    sendFlag(1);
    timerReq = millis();
  }
  if (newDataReceived) {
    Serial.println("rec");
    SensorData myData;
    myData.id = 2;
    myData.temperature = avg();
    sendToAPI(receivedData, myData);
    flag[1] = (res==427?true:false);
    timerReq = millis();
    Serial.println("✅ all data receved");
    newDataReceived = false;
    delay(500);  
  }
}