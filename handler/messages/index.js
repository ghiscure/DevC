require('dotenv').config()
const request = require('request')
const {getMessage, getMessagefromAudio} = require('../../lib/witai')
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const mqtt = require("mqtt");
const listen = mqtt.connect("mqtt://test.mosquitto.org");
const ffmpeg = require ('fluent-ffmpeg')
const fs = require('fs');
const fetch = require('node-fetch');


module.exports = {
   
    handleMessage: async function(sender_psid, received_message){

    let response;
    // Checks if the message contains text
    if (received_message.text) {
      // Create the payload for a basic text message, which
      // will be added to the body of our request to the Send API

      var result = await getMessage(received_message.text)
      var caps= `turning ${result[0][0]} the ${result[1][0]}`
      response = {
        "text": caps
      }
      callSendAPI(sender_psid, response);

      var topic = `esp8266/ghiscure/${result[1][0]}` 
      if(result[0][0]=='on'){
      listen.publish(topic, "1");
      console.log(`${result[0][0]}, ${topic}`);
      }else{
      listen.publish(topic, "0");
      console.log(`${result[0][0]}, ${topic}`);
      }
      
    } 
    else if (received_message.attachments[0].type=="audio") {
      console.log('audio')
      
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      
      
     var result = await fetch(attachment_url)
     proc = new ffmpeg({source:result.body})
     proc.setFfmpegPath('ffmpeg')
     result = proc.saveToFile('output.mp3',  function(stdout, stderr){
          return "success"
     })
    var mimetype_ = "audio/mpeg3"
     var readStream = fs.createReadStream("output.mp3")
     result = await getMessagefromAudio(readStream, mimetype_)
     console.log(result)
     var caps= `turning ${result[0][0]} the ${result[1][0]}`
     response = {
      "text": caps
    }
     callSendAPI(sender_psid, response);
     if(result[0][0]=='on'){
       listen.publish(topic, "1");
       console.log(`${result[0][0]}, ${topic}`);
       }else{
       listen.publish(topic, "0");
       console.log(`${result[0][0]}, ${topic}`);
       }     
    }
  },

  handlePostback: async function(sender_psid, received_postback) {
    console.log('ok')
     let response;
    // Get the payload for the postback
    let payload = received_postback.payload;
  
    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { "text": "Thanks!" }
    } else if (payload === 'no') {
      response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  }
  
};

async function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v8.0/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

function convert(input, output, callback) {
  ffmpeg(input)
      .output(output)
      .on('end', function() {                    
          console.log('conversion ended');
          callback(null);
      }).on('error', function(err){
          console.log('error: ', e.code, e.msg);
          callback(err);
      }).run();
}

// curl -XPOST 'https://api.wit.ai/speech?v=20200513' \-i -L \-H "Authorization: Token" \-H "Content-Type: audio/mpeg3" \--data-binary "@./input/turn.mp3"
