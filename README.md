# Build Chat Bot to Control Your Home

<!-- PROJECT LOGO -->
<br />
<p align="center">
  
  <h3 align="center">ghiscure</h3>

  <p align="center">
    Simple chat bot to control your home
    <br />
    <a href="https://github.com/ghiscure/DevC#toc"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://m.me/ghiscure">View Demo</a>
    ·
    <a href="https://github.com/ghiscure/DevC/issues">Report Bug</a>
    ·
    <a href="https://github.com/ghiscure/DevC/issues">Request Feature</a>
  </p>
</p>
*Read this in other languages: [English](README.md), [Indonesia](README.id.md).*

<a name="toc"></a>

## Table of Contents
* **[Introduction](#introduction)**
* **[Smart Home Unit and Component](#smarthome)**
* **[System Configuration](#system)**
* **[Chatbot as Control System](#chatbot)**
  - [Facebook Messenger](#messenger)
  - [Wit.ai](#wit.ai)
* **[Communication](#communication)**
  - [API](#api)
  - [MQTT](#mqtt)
* **[How it works](#works)**
  - [Facebook Messenger](#facebook_messenger)
  - [Wit.ai](#Wit_ai)
  - [NodeMCU](#node_mcu)
  
* **[How To Use](#howtouse)**
  - [Installation](#installation)
     - [NodeJs](#nodejs)
     - [Git](#git)
     - [Chat Bot](#messenger)
     - [NodeMCU](#nodemcu)
  <!-- - [Configuration](#configuration) -->
  - [Deploy](#deploy)
      - [Heroku](#heroku)
      - [Ngrok](#ngrok)
* **[License](#project-license)** 
  
<!-- Introduction -->
<a name="introduction"></a>
## Introduction


<!-- Smart Home -->
<a name="smarthome"></a>
## Smart Home Unit and Component


<!-- System Configurantion -->
<a name="system"></a>
## System Configuration
![System Configuration](./Documentation/img/System.png)


<!-- Chatbot -->
<a name="chatbot"></a>
## Chatbot as Control System

  <a name="mesenger"></a>

  ### Facebook Messenger
  
  <a name="wit.ai"></a>
  
  ### [wit.ai](#)
  ### Build Your APP
  On this section i will show you how to build an app to control lamp.


<a name="communication"></a>

## Communcation
  <a name="api"></a>
  
  ### API
  
  <a name="mqtt"></a>
  
  ### MQTT







<a name="works"></a>

## How it works

<a name="facebook_messenger"></a>

A. Facebook Messenger
1. Received text message from user and send it to wit.ai
   ```js
   if (received_message.text) {
      
      // Send text to wit.ai and get response
      var result = await getMessage(received_message.text)
      var caps= `turning ${result[0][0]} the ${result[1][0]}`

      // Send command to user
      response = {
        "text": caps
      }
      callSendAPI(sender_psid, response);


      //send result to MQTT Broker and NodeMCU
      var topic = `esp8266/ghiscure/${result[1][0]}` 
      if(result[0][0]=='on'){
      listen.publish(topic, "1");
      console.log(`${result[0][0]}, ${topic}`);
      }else{
      listen.publish(topic, "0");
      console.log(`${result[0][0]}, ${topic}`);
      }
      
    } 
   ```
2. Received voice notes from user and send it to wit.ai
   ```js
   else if (received_message.attachments[0].type=="audio") {
      console.log('audio')
      
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      
    // Convert voice notes to mp3
     var result = await fetch(attachment_url)
     proc = new ffmpeg({source:result.body})
     proc.setFfmpegPath('ffmpeg')
     result = proc.saveToFile('output.mp3',  function(stdout, stderr){
          return "success"
     })

     // Send mp3 to wit.ai
    var mimetype_ = "audio/mpeg3"
     var readStream = fs.createReadStream("output.mp3")

     // Get Result from wit.ai
     result = await getMessagefromAudio(readStream, mimetype_)
     console.log(result)
     var caps= `turning ${result[0][0]} the ${result[1][0]}`
     response = {
      "text": caps
    }

    // send result to MQTT Broker and NodeMCU
     callSendAPI(sender_psid, response);
     if(result[0][0]=='on'){
       listen.publish(topic, "1");
       console.log(`${result[0][0]}, ${topic}`);
       }else{
       listen.publish(topic, "0");
       console.log(`${result[0][0]}, ${topic}`);
       }     
    }
   ```
<a name="wit_ai"></a>

B. Wit.ai

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
```

<a name="node_mcu"></a>

C. NodeMCU
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

<a name="howtouse"></a>

## How to Use


<a name="installation"></a>

### Installation

A.  Git
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

B.  NodeJs
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

C.  Facebook Messenger
#### Prerequisite
Before you use this app, you must register your app in facebook platform. You can follow this tutorial to get PAGE_ACCESS_TOKEN.
```
https://developers.facebook.com/docs/messenger-platform/getting-started-app-setup
```

After you have PAGE_ACCESS_TOKEN, just follow this step
```bash
git clone https://github.com/ghiscure/DevC
cd DevC
mv .env.example .env
#Edit .env with your app credentials
npm install
npm start
```
<a name="nodemcu"></a>

D.  NodeMCU

1. Install Arduino
```
https://www.arduino.cc/en/main/software
```
2. Install NodeMCU board in Arduino
```
https://randomnerdtutorials.com/how-to-install-esp8266-board-arduino-ide/
```
3. Wiring Schematic
```
Image
```
4. Edit config of wireless connection
```c
// Change the credentials below, so your ESP8266 connects to your router
const char* ssid = ""; // your ssid name
const char* password = ""; // password ssid
```
5. Upload file to NodeMCU

![Upload to NodeMCU](./Documentation/img/upload_nodemcu.png)

### Deploy
1. Heroku
   1. You can use this tutorial to deploy app
   ```
   https://devcenter.heroku.com/articles/deploying-nodejs
   ```
   2. You must edit environment variable. You can use this tutorial to edit env variable. 
   ```
   https://devcenter.heroku.com/articles/config-vars
   ```
   3. There are 3 environment variable that you must set in config vars.
      *  PAGE_ACCESS_TOKEN
      *  VERIFY_TOKEN
      *  witai_token
   4. Change your URL callback in facebook account
2. Ngrok <br>
   You can use ngrok to forwarding http protocol. Follow this tutorial to forward your localhost to public. Change your Facebook's URL callback to ngrok url.
   ```
   https://ngrok.com/docs
   ```




<a name="project-license"></a>

## License
Usage is provided under the [MIT License](http://opensource.org/licenses/mit-license.php). See LICENSE for the full details.
