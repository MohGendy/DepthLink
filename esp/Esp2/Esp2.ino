#include <ESP8266WiFi.h>
#include <espnow.h>
#include <Wire.h>
#include <Adafruit_VL53L0X.h>

#define Buzzer_Signal D5 

Adafruit_VL53L0X lox;

uint8_t receiverMAC[] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 }; // mac address

bool reqData = false;
struct SensorData {
    short id;
    float temperature;
};
bool flag[2] = {0,0};
float arr[3];
short i = 0;
unsigned long timerReading; 

float avg(){
  return (arr[0]+arr[1]+arr[2])/3.0;
}

float reading(){
    VL53L0X_RangingMeasurementData_t measure;
    lox.rangingTest(&measure, false); // Get the measurement
    if (measure.RangeStatus != 4 && measure.RangeMilliMeter  != 8191) { // Check if measurement was successful
      float correctedDistance = (measure.RangeMilliMeter - 40)/10.0;  // Apply the 40mm offset
      flag[0] = false;
      Serial.println(correctedDistance);

      return correctedDistance;
    } else {
      //set err flag
      flag[0] = true;
      return avg();
    }
  
}
  


void OnDataRecv(uint8_t *mac_addr, uint8_t *incomingData, uint8_t len) {
    uint8_t msg = *incomingData;
    if(msg == 1){
      reqData = true;
    }
    Serial.print("msg receved");
    Serial.println(msg);
}


void OnDataSent(uint8_t *mac_addr, uint8_t sendStatus) {
    Serial.print("Delivery Status: ");
    Serial.println(sendStatus == 0 ? "Success" : "Fail");
}

void setup() {
    Serial.begin(9600);
    Serial.println("setup started");

    Wire.begin(D7, D8); // Set SDA to D7 , SCL to D8
    Serial.println("setup started2");
    if (!lox.begin()) {
          Serial.println("tof not working");
          ESP.restart();
    }else{
          Serial.println("tof working");
    }
  
    WiFi.mode(WIFI_STA);
    
    if (esp_now_init() != 0) {
        Serial.println("ESP-NOW Init Failed!");
        return;
    }
    
    esp_now_set_self_role(ESP_NOW_ROLE_COMBO);
    esp_now_register_send_cb(OnDataSent);
    esp_now_register_recv_cb(OnDataRecv);
    esp_now_add_peer(receiverMAC, ESP_NOW_ROLE_COMBO, 1, NULL, 0);
    arr[0] = reading();
    arr[1] = reading();
    arr[2] = reading();
    timerReading = millis();
    pinMode(Buzzer_Signal,OUTPUT);
    digitalWrite(Buzzer_Signal , LOW);
    Serial.println("start...");

}

void loop() {
    if(flag[0]||flag[1]){
        digitalWrite(Buzzer_Signal , HIGH);
        delay(100);
    }else{
        digitalWrite(Buzzer_Signal , LOW);
    }  
  if(millis() - timerReading > 10000){
    Serial.println("read");
    arr[i] = reading();
    i = (i+1)%3;
    timerReading = millis();
  }
  if(reqData){
    Serial.println("req");
    SensorData data;
    delay(500);
    data.id = 1;
    data.temperature = avg();
    esp_now_send(receiverMAC, (uint8_t *)&data, sizeof(data));
    reqData = false;
  }
  
 
}