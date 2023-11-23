#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <EEPROM.h>

/////////////////////////////////////////////////////////////////////////////////////
const char* ssid = "TP-Link_F7C6";                       // Название Вашей WiFi сети
const char* password = "22068927";                      // Пароль от Вашей WiFi сети
////////////////// Если необходимо статический IP ESP8266 ///////////////////////////
//IPAddress ip(192,168,47,222);                             // Статический IP ESP8266
//IPAddress gateway(192,168,47,205);                          // Статический IP роутера
//IPAddress subnet(255,255,255,0);                         // Маска сети
/////////////////////////////////////////////////////////////////////////////////////

String inputMessage = "";                            // 
String lastTemperature;

/////////////////////////////////////////////////////////////////////////////////////


const char* PARAM_INPUT = "threshold_input";

/////////////Интервал между обновлением показаний датчика DS18B20////////////////////
unsigned long previousMillis = 0;     
const long interval = 60000;    

/////////////////////////////////////////////////////////////////////////////////////
const int output = 4;                   // Вывод GPIO куда подключено реле
const int oneWireBus = 2;               // Вывод GPIO куда подключен DS18B20     
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);
/////////////////////////////////////////////////////////////////////////////////////
const char* host = "178.217.170.5";
const int httpsPort = 4000; // или 80 для HTTP

// GraphQL query
String response;
WiFiClient client;
void setup() 
{
 EEPROM.begin(512);                                      
 Serial.begin(115200);                                    // Создаем последовательную связь на скорости 115200
 WiFi.mode(WIFI_STA);                                     
 WiFi.begin(ssid, password);                              // Передаем данные о WiFI сети
// WiFi.config(ip, gateway, subnet);                        // Передаем данные о WiFI сети

///////////////////////  Проверка подключение к Wi-Fi сети  /////////////////////////
  if (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("WiFi Failed!");
    return;}
/////////////////////////////////////////////////////////////////////////////////////

  Serial.println();                                       // Новая строка               
  Serial.println(WiFi.localIP());                         // Отправка IP
  pinMode(output, OUTPUT);                                // Установка вывода output, как выход
  digitalWrite(output, LOW);                              // Устанавливаем output в LOW
  sensors.begin();                                        // Инициализация DS18B20


}

void loop()
{
EEPROM.get(0, inputMessage);                                           // Чтение данных с EEPROM
unsigned long currentMillis = millis();                                // Записываем данные в currentMillis

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    sensors.requestTemperatures();                                     // Чтение даных о температуре
    float temperature = sensors.getTempCByIndex(0);                    // Запись данных температуры в temperature
    Serial.print(temperature);                                         // Отправка данных о температуре
    Serial.println(" *C");                                             // Печать текста
    lastTemperature = String(temperature); 
                                
 // Формирование и отправка HTTP запроса
   // Создание клиента

  if (!client.connect(host, httpsPort)) {
    Serial.println("Connection failed");
  }
  char query[128]; // Убедитесь, что размер буфера достаточно большой
  sprintf(query, "{\"query\":\"{ power(temp: \\\"%f\\\") }\"}", temperature);

  client.println("POST /graphql HTTP/1.1");
  client.println("Host: " + String(host));
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(strlen(query));
  client.println();
  client.println(query);

  // Чтение и вывод ответа
  while (client.connected()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") {
      break;
    }
  }
  while (client.available()) {
    response = client.readStringUntil('\n');
    Serial.println(response);
  }
  const size_t capacity = JSON_OBJECT_SIZE(2) + JSON_OBJECT_SIZE(1) + 60;
  DynamicJsonDocument doc(capacity);

  DeserializationError error = deserializeJson(doc, response);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.f_str());
    return;
  }

  String command = doc["data"]["power"]; // "0"
    Serial.println(command);
  
////////////////////////////////////  Включение реле  ///////////////////////////////  
    if(command=="1"){
       digitalWrite(output, LOW);
       Serial.println("Relay ON");}
/////////////////////////////////////////////////////////////////////////////////////        

////////////////////////////////////  Выключение реле  //////////////////////////////
    else if(command=="0") {
       digitalWrite(output, HIGH);
       Serial.println("Relay OFF");}
///////////////////////////////////////////////////////////////////////////////////// 
  }
}
