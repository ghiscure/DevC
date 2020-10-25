# Build Chat Bot to Control Your Home

<!-- PROJECT LOGO -->
<br />
<p align="center">
  
  <h3 align="center">ghiscure</h3>

  <p align="center">
    Simple chat bot to control your home
    <br />
    <a href="https://github.com/ghiscure/DevC"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="m.me/ghiscure">View Demo</a>
    ·
    <a href="https://github.com/ghiscure/DevC/issues">Report Bug</a>
    ·
    <a href="https://github.com/ghiscure/DevC/issues">Request Feature</a>
  </p>
</p>

## Table of Contents
* **[Wit.ai](#wit)**
* **[How it works](#works)**
* **[Installation](#installation)**
  - [NodeJs](#nodejs)
  - [Git](#git)
  - [Messenger](#messenger)
  - [Arduino](#Arduino)
* **[Tests](#tests)**
* **[FAQ](#questions)**
* **[Requested Distributions](#requests)**
* **[License](#project-license)**

<a name="wit.ai"></a>
## Wit.ai
### Build Your APP
On this section i will show you how to build an app to control lamp.


<a name="works"></a>
## How it works

### Wit.ai

1. Get Message from text parameter
```js
    // This function use for get response from wit.ai. This function require a string parameter
      getMessage: async function(query){
    var url =`https://api.wit.ai/message?v=20201020&q=${encodeURI(query)}` 

    var response = await fetch(url, {
        headers: {
            'Authorization': 'Your Api Token'
        }
    })
    var json_data = await response.json()
    try {

      // Get Command Value
      var cmd_value =json_data.traits.wit$on_off[0].value
      var cmd_confidence = json_data.traits.wit$on_off[0].confidence

      // Get Object Value
      var object_value = json_data.entities['object:object'][0].value
      var object_confidence = json_data.entities['object:object'][0].confidence

      return [[cmd_value,cmd_confidence],[object_value,object_confidence]]   

    } catch (error) {
      console.log(error)
      
    }
    
  }
```


  
2. Get Message from voice notes
```js
    // This function use for get response from wit.ai. This function require a audio file as parameter
      getMessagefromAudio: async function(bin_data, mimetype_){
    var options = {
        method: 'POST',
        headers: {
            'Authorization': process.env.witai_token,
            'Content-Type': mimetype_
        },
        encoding: null,
        body: bin_data
      }
    var url =`https://api.wit.ai/speech?v=20200513` 
    try {
        // Get response from wit.ai
      var response = await fetch(url, options)
      var json_data = await response.json()
      
      // Get Command Value
      var cmd_value =json_data.traits.wit$on_off[0].value
      var cmd_confidence = json_data.traits.wit$on_off[0].confidence

      // Get Object Value
      var object_value = json_data.entities['object:object'][0].value
      var object_confidence = json_data.entities['object:object'][0].confidence

      console.log(cmd_value, cmd_confidence)
      console.log(object_value, object_confidence)  
      return [[cmd_value,cmd_confidence],[object_value,object_confidence]]     
    } catch (error) {
      console.log(error)
      
    }
  }

  ### NodeMCU
```
1. Received data from MQTT Broker and Turn on/off the lamp
```c
// If a message is received on the topic esp8266/ghiscure/AC, you check if the message is either 1 or 0. Turns the ESP GPIO according to the message

  if(topic=="esp8266/ghiscure/AC"){
      Serial.print("Changing GPIO 4 to ");
      if(messageTemp == "1"){
        digitalWrite(ledGPIO4, HIGH); //Turn on AC
        Serial.print("On");
      }
      else if(messageTemp == "0"){
        digitalWrite(ledGPIO4, LOW); //Turn off AC
        Serial.print("Off");
      }
  }
    // If a message is received on the topic esp8266/ghiscure/lamp, you check if the message is either 1 or 0. Turns the ESP GPIO according to the message

  if(topic=="esp8266/ghiscure/lamp"){
      Serial.print("Changing GPIO 5 to ");
      if(messageTemp == "1"){
        digitalWrite(ledGPIO5, HIGH); // turn on lamp
        Serial.print("On");
      }
      else if(messageTemp == "0"){
        digitalWrite(ledGPIO5, LOW); //turn off lamp
        Serial.print("Off");
      }
  }
```

2. Subscribe topic
```c
// You need to add subscribe function to get message from spesific topic
client.subscribe("esp8266/ghiscure/AC");
client.subscribe("esp8266/ghiscure/lamp");
```

<a name="installation"></a>

## Installation

### Git
1. Start by updating the package index
```bash
sudo apt update
```
2. Run the following command to install Git:
```bash
sudo apt install git
```
3. Verify the installation by typing the following command which will print the Git version:
```bash
git --version
```
4. Windows Installations
```
https://git-scm.com/download/win
```

### NodeJs
1. Debian Based
```sh
# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs
```
2. Windows
```
https://nodejs.org/en/download/
```

<a name="messenger"></a>

### Messenger
```bash
git clone https://github.com/ghiscure/DevC
cd DevC
npm install
cp .env.example .env
Change .env with your credentials
npm start
```
<a name="Arduino"></a>

### Arduino

1. Install Arduino
```
https://www.arduino.cc/en/main/software
```
2. Wiring Schematic
```
Image
```
3. Edit config of wireless connection
```c
// Change the credentials below, so your ESP8266 connects to your router
const char* ssid = ""; // your ssid name
const char* password = ""; // password ssid
```
4. Upload file to NodeMCU
```
Image
```




## License
Usage is provided under the [MIT License](http://opensource.org/licenses/mit-license.php). See LICENSE for the full details.
