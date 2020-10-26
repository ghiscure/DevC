# Membuat Bot Percakapan Untuk Mengatur Rumah Anda

<!-- PROJECT LOGO -->
<br />
<p align="center">
  
  <h3 align="center">ghiscure</h3>

  <p align="center">
    bot percakapan simpel untuk mengatur rumah anda
    <br />
    <a href="https://github.com/ghiscure/DevC#toc"><strong>Jelajahi dokumentasi »</strong></a>
    <br />
    <br />
    <a href="https://m.me/ghiscure">Lihat Demo</a>
    ·
    <a href="https://github.com/ghiscure/DevC/issues">Laporkan gangguan</a>
    ·
    <a href="https://github.com/ghiscure/DevC/issues">Ajukan Fitur</a>
  </p>
</p>

## Languange
*Baca ini dalam bahasa lain: [Inggris](README.md), [Indonesia](README.id.md).*

<a name="toc"></a>

## Daftar Isi
* **[Pengenalan](#introduction)**
* **[<em>Smart Home</em> dan komponennya](#smarthome)**
* **[Konfigurasi sistem](#system)**
* **[Bot percakapan sebagai sistem kontrol](#chatbot)**
  - [Facebook Messenger](#messenger)
  - [Wit.ai](#wit.ai)
* **[Komunikasi](#communication)**
  - [API](#api)
  - [MQTT](#mqtt)
* **[Bagaimana sistem ini bekerja](#works)**
  - [Facebook Messenger](#facebook_messenger)
  - [Wit.ai](#Wit_ai)
  - [NodeMCU](#node_mcu)
  
* **[Cara penggunaan](#howtouse)**
  - [Instalasi](#installation)
     - [NodeJs](#nodejs)
     - [Git](#git)
     - [Wit.ai](#instalasi_witai)
     - [Server](#server)
     - [NodeMCU](#nodemcu)
  <!-- - [Configuration](#configuration) -->
  - [Deploy](#deploy)
      - [Heroku](#heroku)
      - [Ngrok](#ngrok)
* **[Lisensi](#project-license)** 
  
<!-- Pengenalan -->
<a name="introduction"></a>
## Pengenalan


<!-- rumah cerdas -->
<a name="smarthome"></a>
## <emp>Smart Home</emp> dan komponennya


<!-- Konfigurasi Sistem -->
<a name="system"></a>
## Konfigurasi Sistem
![Konfigutasi sistem](./Documentation/img/System.png)


<!-- Bot Percakapan -->
<a name="chatbot"></a>
## Bot percakapan sebagai sistem kontrol

  <a name="mesenger"></a>

  ### Facebook Messenger
  Facebook messenger digunakan untuk menerima pesan dari user. Pesan tersebut dapat berupa pesan suara maupun pesan teks. Untuk pembuatan messenger anda dapat mengikuti panduan berikut
  1. Membuat akun [facebook](https://facebook.com)
  2. Membuat [pages](https://www.facebook.com/pages/create) facebook 
  3. Membuat applikasi pada [<em>Dashboard Facebook</em>](https://developers.facebook.com/apps/)
  4. Ada 4 hal yang harus anda perhatikan
      - Generate Token. Token tersebut akan digunakan untuk konfigurasi pada server
      - Callback URL. URL tersebut akan digunakan untuk konfigurasi pada server
      - Verify Token. Verify Token terserah anda. Verify token nantinya akan digunakan untuk konfigurasi server
      - Ijinkan layanan messages untuk dapat menggunakannya.
![Facebook](./Documentation/img/facebook.png)
  
  <a name="wit.ai"></a>
  
  ### Wit.ai
  ### Buat aplikasimu
  Pada bagian ini saya akan menunjukkan bagaimana cara membuat aplikasi untuk mengontrol lampu.


<!-- <a name="communication"></a>

## Communcation
  <a name="api"></a>
  
  ### API
  
  <a name="mqtt"></a>
  
  ### MQTT -->







<a name="works"></a>

## Bagaimana Ini Bekerja

<a name="facebook_messenger"></a>

A. Facebook Messenger
1. Menerima teks pesan dari pengguna dan mengirimkannya ke wit.ai
   ```js
   if (received_message.text) {
      
      // Mengirimkan teks ke wit.ai dan mendapatkan respon
      var result = await getMessage(received_message.text)
      var caps= `turning ${result[0][0]} the ${result[1][0]}`

      // Kirimkan perintah kepada user
      response = {
        "text": caps
      }
      callSendAPI(sender_psid, response);


      //kirim hasil ke broker MQTT dan NodeMCU
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
2. Menerima pesan suara dari pengguna dan mengirimkannya ke wit.ai
   ```js
   else if (received_message.attachments[0].type=="audio") {
      console.log('audio')
      
      // Dapatkan URL dari lampiran pesan
      let attachment_url = received_message.attachments[0].payload.url;
      
    // konversi pesan suara ke mp3
     var result = await fetch(attachment_url)
     proc = new ffmpeg({source:result.body})
     proc.setFfmpegPath('ffmpeg')
     result = proc.saveToFile('output.mp3',  function(stdout, stderr){
          return "success"
     })

     // Kirim mp3 ke wit.ai
    var mimetype_ = "audio/mpeg3"
     var readStream = fs.createReadStream("output.mp3")

     // Dapatkan hasil dari wit.ai
     result = await getMessagefromAudio(readStream, mimetype_)
     console.log(result)
     var caps= `turning ${result[0][0]} the ${result[1][0]}`
     response = {
      "text": caps
    }

    // Kirimkan hasil ke broker MTQQ dan NodeMCU
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

1. Dapatkan pesan dari parameter text
```js
    // fungsi ini digunakan untuk mendapatkan respon dari wit.ai. fungsi ini membutuhkan string sebagai parameternya
      getMessage: async function(query){
    var url =`https://api.wit.ai/message?v=20201020&q=${encodeURI(query)}` 

    var response = await fetch(url, {
        headers: {
            'Authorization': 'Your Api Token'
        }
    })
    var json_data = await response.json()
    try {

      // Dapatkan nilai perintah
      var cmd_value =json_data.traits.wit$on_off[0].value
      var cmd_confidence = json_data.traits.wit$on_off[0].confidence

      // Dapatkan nilai objek
      var object_value = json_data.entities['object:object'][0].value
      var object_confidence = json_data.entities['object:object'][0].confidence

      return [[cmd_value,cmd_confidence],[object_value,object_confidence]]   

    } catch (error) {
      console.log(error)
      
    }
    
  }
```
  
2. Dapatkan pesan dari pesan suara
```js
    // Fungsi ini digunakan untuk mendapatkan respon dari wit.ai. fungsi ini membutuhkan string sebagai parameternya
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
        // Dapatkan respon dari wit.ai
      var response = await fetch(url, options)
      var json_data = await response.json()
      
      // Dapatkan nilai perintah
      var cmd_value =json_data.traits.wit$on_off[0].value
      var cmd_confidence = json_data.traits.wit$on_off[0].confidence

      // Dapatkan nilai objek
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
1. Terima data dari broker MTQQ dan menyalakan/mematikan lampu
```c

// Jika pesan diterima di topik esp8266/ghiscure/AC, silahkan anda cek apakah pesannya bernilai 1 atau 0. ubah ESP GPIO menurut pesan yang diterima

  if(topic=="esp8266/ghiscure/AC"){
      Serial.print("Changing GPIO 4 to ");
      if(messageTemp == "1"){
        digitalWrite(ledGPIO4, HIGH); //Nyalakan AC
        Serial.print("On");
      }
      else if(messageTemp == "0"){
        digitalWrite(ledGPIO4, LOW); //Matikan AC
        Serial.print("Off");
      }
  }
// Jika pesan diterima pada topik esp8266/ghiscure/lamp, silahkan cek apakah pesannya bernilai 1 atau 0. Ubah ESP GPIO menurut pesan yang diterima

  if(topic=="esp8266/ghiscure/lamp"){
      Serial.print("Changing GPIO 5 to ");
      if(messageTemp == "1"){
        digitalWrite(ledGPIO5, HIGH); // nyalakan lampu
        Serial.print("On");
      }
      else if(messageTemp == "0"){
        digitalWrite(ledGPIO5, LOW); //matikan lampu
        Serial.print("Off");
      }
  }
```

2. <em>Subscribe</em> Topik
```c
// Anda perlu menambahkan fungsi langganan untuk mendapatkan pesan dari topik tertentu
client.subscribe("esp8266/ghiscure/AC");
client.subscribe("esp8266/ghiscure/lamp");
```

<a name="howtouse"></a>

## Cara Penggunaan


<a name="installation"></a>

### Instalasi

<a name="git"></a>

A.  Git
1. Mulai dengan memperbarui package
```bash
sudo apt update
```
2. Jalankan perintah di bawah untuk memasang Git:
```bash
sudo apt install git
```
3. verifikasi pemasangan dengan menulis perintah berikut yang akan menuliskan versi dari Git:
```bash
git --version
```
4. Pemasangan pada Windows
```
https://git-scm.com/download/win
```
<a name="nodejs"></a>

B.  NodeJs
1. Berbasis Debian
```sh
# Menggunakan Ubuntu
curl -sL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Menggunakan Debian, sebagai root
curl -sL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs
```
2. Windows
```
https://nodejs.org/en/download/
```

<a name="messenger"></a>

C.  Facebook Messenger
#### Prasyarat
1. Sebelum menggunakan aplikasi ini, anda perlu mendaftarkan aplikasi anda di platform facebook. Anda dapat mengikuti tata cara ini untuk mendapatkan PAGE_ACCESS_TOKEN.
```
https://developers.facebook.com/docs/messenger-platform/getting-started-app-setup
```



2. Setelah anda mendapatkan PAGE_ACCESS_TOKEN, ikuti langkah berikut
```bash
git clone https://github.com/ghiscure/DevC
cd DevC
mv .env.example .env
# Ubah .env dengan kredensial aplikasi anda
npm install
npm start
```
<a name="nodemcu"></a>

D.  NodeMCU

1. Pasang Aplikasi Arduino
```
https://www.arduino.cc/en/main/software
```
2. Pasang papan NodeMCU di Arduino
```
https://randomnerdtutorials.com/how-to-install-esp8266-board-arduino-ide/
```
3. Skema pengkabelan
```
Image
```
4. Ubah konfigurasi dari koneksi nirkabel
```c
// ubah kredensial di bawah agar ESP8266 milik anda dapat terkoneksi ke router 
const char* ssid = ""; // nama ssid anda
const char* password = ""; // password ssid
```
5. Unggah berkas ke NodeMCU

![Unggah ke NodeMCU](./Documentation/img/upload_nodemcu.png)

### Deploy
1. Heroku
   1. Anda bisa gunakan tata cara ini untuk men-deploy aplikasi
   ```
   https://devcenter.heroku.com/articles/deploying-nodejs
   ```
   1. Anda harus mengubah environment variable. Anda bisa gunakan tata cara ini untuk mengedit variable env. 
   ```
   https://devcenter.heroku.com/articles/config-vars
   ```
   1. Terdapat 3 environment variable yang harus diatur dalam config vars.
      *  PAGE_ACCESS_TOKEN
      *  VERIFY_TOKEN
      *  witai_token
   2. Ubah URL callback anda di akun facebook 
2. Ngrok <br>
   Anda bisa gunakan Ngrok untuk melakukan penerusan/forwarding protokol HTTP. Ikuti tata cara di bawah ini untuk meneruskan localhost anda kepada publik. Ubah URL facebook anda ke URL Ngrok.
   ```
   https://ngrok.com/docs
   ```




<a name="project-license"></a>

## License
Penggunaan disediakan di bawah [Lisensi MIT](http://opensource.org/licenses/mit-license.php). Lihat LISENSI untuk detail lengkap.