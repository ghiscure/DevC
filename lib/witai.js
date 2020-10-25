var fetch = require('node-fetch');
require('dotenv').config()

module.exports = {
   
    getMessage: async function(query){
      var url =`https://api.wit.ai/message?v=20201020&q=${encodeURI(query)}` 
  
      var response = await fetch(url, {
          headers: {
              'Authorization': process.env.witai_token
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
  
        console.log(cmd_value, cmd_confidence)
        console.log(object_value, object_confidence)  
        return [[cmd_value,cmd_confidence],[object_value,object_confidence]]   
  
      } catch (error) {
        console.log(error)
        
      }
      
    },
  
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
    
  };