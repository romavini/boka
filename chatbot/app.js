const { Client, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: true
}));

const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  session: sessionCfg
});



/* client.on('message', msg => {
  if (msg.body == '!ping') {
    msg.reply('pong');
  } else if (msg.body == 'good morning') {
    msg.reply('selamat pagi');
  } else if (msg.body == '!groups') {
    client.getChats().then(chats => {
      const groups = chats.filter(chat => chat.isGroup);

      if (groups.length == 0) {
        msg.reply('You have no group yet.');
      } else {
        let replyMsg = '*YOUR GROUPS*\n\n';
        groups.forEach((group, i) => {
          replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
        });
        replyMsg += '_You can use the group id to send a message to the group._'
        msg.reply(replyMsg);
      }
    });
  }
*/
let nome = ""
let CEP = ""
let caminhos = 1
let lon = ""
let lat = ""
let cep = ""
let subcaminho = ""

client.on('message', msg => {
    //console.log(msg)
    console.log("Usuario>> "+ msg.body)

    switch (caminhos){
        case 1:
            //msg.reply("Seja bem vindo(a) a central de auxílio à áreas de risco.\n*Por favor, informe o seu nome:*");
            msg.reply("Welcome to the help center for risk area.\n* Please, informe your name:*")
            caminhos = 2
            break;

        case 2:
            nome = msg.body
            msg.reply("Hi, "+nome+"!\n*Provide your Whastapp location or ZIP code to proceed.*");
            caminhos = 3 
        break;
        case 3:
            console.log("\n\n\n")
            //console.log(msg)
            //console.log(msg.body)
            if (msg.type == "location"){
               console.log("\n")

               console.log("Longitute")
               lon = msg['location']['longitude']
               console.log(lon)

               console.log("Latitude")
               lat = msg['location']['latitude']
               console.log(lat)
                let localizacao = '\"'+lon+";"+lat+"\""
                const execSync = require('child_process').execSync;
                const output = execSync('python ../api/apiservice/api.py 1 '+localizacao, { encoding: 'utf-8' }); 

                var delayInMilliseconds = 1000;
                let json = require("../api/apiservice/response/response_dict.json");
                setTimeout(function() {
                    console.log(json)
                    console.log("Indices Localização!!!")
                    risco = ""
                    if (json['risk'] == "0"){
                        risco = "✅ Low"
                    }else if(json['risk'] == "1"){
                        risco = "⚠️ Moderate"

                    }else if(json['risk'] == "2"){
                        risco = "⛔ High"

                    }
                    msg.reply("*-------Your rates------*\n⛰️Landslides Risk: *"+risco+"*\n🌧️ Preciptation: *"+json['precip']+" mm* ")
                }, delayInMilliseconds);

                /* Envia a lon e lat para o python*/
            }else{
                /* enviar o CEP para o python*/
                console.log("Enviado CEP")

                const execSync = require('child_process').execSync;
                const output = execSync('python ../api/apiservice/api.py 0 '+msg.body, { encoding: 'utf-8' }); 
                var delayInMilliseconds = 1000;
                let json = require("../api/apiservice/response/response_dict.json");
                setTimeout(function() {
                    console.log(json)
                    console.log("Indices!!!")
                    risco = ""
                    if (json['risk'] == "0"){
                        risco = "✅Low"
                    }else if(json['risk'] == "1"){
                        risco = "⚠️ Moderate"

                    }else if(json['risk'] == "2"){
                        risco = "⛔ High"

                    }
                    msg.reply("*-------Your rates------*\n⛰️Landslides Risk: *"+risco+"*\n🌧️ Preciptation: *"+json['precip']+" mm* ")
                }, delayInMilliseconds);

            }
            msg.reply("*"+nome+", inform your current situation:*\n1 - I'm at a risk area.\n2 - I'm not at risk, I'd like to help.")
            caminhos = 4;
        break;
        case 4:
            if (msg.body == "1"){
                msg.reply("*Are you in an emergency situation right now?*\n1- Yes, I need help right now.\n2 - No, but i'd like to submit photo and/or video of the location.")
                caminhos = 5;
            }else if (msg.body == "2"){
                msg.reply("*What kind of help could you offer?*\n1 - Food\n2 - Shelter\n3 - Water\n4 - Construction material\n5 - Others")
                caminhos = 9;
            }
        break;
        case 5:
            if (msg.body == "1"){
                msg.reply("Emergency numbers :\n 199 - Civil Defense\n 193 - Fire Department\n 190 - Military Police\n (XX) XXXX-XXXXX - City Hall\n ")
                msg.reply("*Keep calm, if possible, leave the area immediately and move to a safe place because new landslides may happen at any time.\n*Do you need, any additional help?*\n1 - I need a shelter.\n2 - I need construction material to fix my house.\n3 - I need food or water.\n4 - I neeed another kind of help.")
                caminhos = 6;
            }
            else if(msg.body == "2"){
                msg.reply("*Do you authorize this data to be sent to the civil defense for the opening of a protocol about your situation?*\n1 - Yes\n2 - No")
            caminhos = 7;
            }
        break;
        case 6:
            switch(msg.body){
            case "1":
                    msg.reply("Go to <PLACE>, at <ADDRESS>")
                    msg.reply("*Thanks you for contact us.*")
            break;
            case "2":
                    msg.reply("Go to <PLACE>, at <ADDRESS>")
                    msg.reply("*Thanks you for contact us.*")
            break;
            break;
             case "3":

                    msg.reply("Go to <PLACE>, at <ADDRESS>")
                    msg.reply("*Thanks you for contact us.*")
            break;
            break;
            case "4":

                    msg.reply("Go to <PLACE>, at <ADDRESS>")
                    msg.reply("*Thanks you for contact us.*")
            break;
            break;
            }
            caminhos = 0
        break;
        case 7:
            if(msg.body == "1"){
                msg.reply("Attach your photos and/or videos.")
            }
            msg.reply("*Would you like to receive tips to minimize the landslide risk*\n1 - Yes\n2 - No" )
            caminhos = 8;
        break;
        case 8:
            if(msg.body == "1"){
                msg.reply("You have been registered to receive the tips.")
            }
            caminhos = 0
            msg.reply("*Thanks you for contact us.*")
        break;
        case 9:
            msg.reply("We appreciate your availability.\nWe will contact you when the need arises.")
        break;
        default:
            msg.reply("*Thanks you for contact us.*")
    }

  if (msg.body == '!ping') {
    msg.reply('pong');
  } else if (msg.body == 'good morning') {
    msg.reply('selamat pagi');
  } else if (msg.body == '!groups') {
    client.getChats().then(chats => {
      const groups = chats.filter(chat => chat.isGroup);

      if (groups.length == 0) {
        msg.reply('You have no group yet.');
      } else {
        let replyMsg = '*YOUR GROUPS*\n\n';
        groups.forEach((group, i) => {
          replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
        });
        replyMsg += '_You can use the group id to send a message to the group._'
        msg.reply(replyMsg);
      }
    });
  }



  // Downloading media
  if (msg.hasMedia) {
    msg.downloadMedia().then(media => {
      // To better understanding
      // Please look at the console what data we get
      console.log(media);

      if (media) {
        // The folder to store: change as you want!
        // Create if not exists
        const mediaPath = './downloaded-media/';

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }

        // Get the file extension by mime-type
        const extension = mime.extension(media.mimetype);
        
        // Filename: change as you want! 
        // I will use the time for this example
        // Why not use media.filename? Because the value is not certain exists
        const filename = new Date().getTime();

        const fullFilename = mediaPath + filename + '.' + extension;

        // Save to file
        try {
          fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' }); 
          console.log('File downloaded successfully!', fullFilename);
        } catch (err) {
          console.log('Failed to save the file:', err);
        }
      }
    });
  }
});

client.initialize();

// Socket IO
io.on('connection', function(socket) {
  socket.emit('message', 'Connecting...');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR Code received, scan please!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });

  client.on('authenticated', (session) => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated!');
    console.log('AUTHENTICATED', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
      if (err) {
        console.error(err);
      }
    });
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', 'Auth failure, restarting...');
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'Whatsapp is disconnected!');
    fs.unlinkSync(SESSION_FILE_PATH, function(err) {
        if(err) return console.log(err);
        console.log('Session file deleted!');
    });
    client.destroy();
    client.initialize();
  });
});


const checkRegisteredNumber = async function(number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}

// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Send media
app.post('/send-media', async (req, res) => {
  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  // const media = MessageMedia.fromFilePath('./image-example.png');
  // const file = req.files.file;
  // const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name);
  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  client.sendMessage(number, media, {
    caption: caption
  }).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

const findGroupByName = async function(name) {
  const group = await client.getChats().then(chats => {
    return chats.find(chat => 
      chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
    );
  });
  return group;
}

// Send message to group
// You can use chatID or group name, yea!
app.post('/send-group-message', [
  body('id').custom((value, { req }) => {
    if (!value && !req.body.name) {
      throw new Error('Invalid value, you can use `id` or `name`');
    }
    return true;
  }),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  let chatId = req.body.id;
  const groupName = req.body.name;
  const message = req.body.message;

  // Find the group by name
  if (!chatId) {
    const group = await findGroupByName(groupName);
    if (!group) {
      return res.status(422).json({
        status: false,
        message: 'No group found with name: ' + groupName
      });
    }
    chatId = group.id._serialized;
  }

  client.sendMessage(chatId, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Clearing message on spesific chat
app.post('/clear-message', [
  body('number').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  const chat = await client.getChatById(number);
  
  chat.clearMessages().then(status => {
    res.status(200).json({
      status: true,
      response: status
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  })
});

server.listen(port, function() {
  console.log('App running on *: ' + port);
});
