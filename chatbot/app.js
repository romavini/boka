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
            msg.reply("Seja bem vindo(a) a central de auxílio à áreas de risco.\n😉Por favor, informe o seu nome:");
            caminhos = 2
            break;

        case 2:
            nome = msg.body
            msg.reply("Ola "+nome+"\nForneça a sua localização do Whatsapp ou CEP para proseguir:");
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
                    msg.reply("Seus indices:\n☔Preciptação: "+json['precip']+"\n⛰️Risco de Deslizamento: "+json['risk'])
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
                    msg.reply("Seus indices:\n☔Preciptação: "+json['precip']+"\n⛰️Risco de Deslizamento: "+json['risk'])
                }, delayInMilliseconds);

            }
            msg.reply(nome+", nos informe sua situação atual:\n1 - Estou em área de risco.\n2 - Não estou em risco, gostaria de ajudar.")
            caminhos = 4;
        break;
        case 4:
            if (msg.body == "1"){
                msg.reply("Está em situação de emergência neste momento?\n1- Sim, preciso de ajuda agora\n2 - Não, mas gostaria de enviar foto e/ou video do local.")
                caminhos = 5;
            }else if (msg.body == "2"){
                msg.reply("Quais tipos de ajuda você pode oferecer?\n1 - Alimentos\n2 - Abrigo\n3 - Agua\n4 - Material de construção\n5 - Outros")
                caminhos = 9;
            }
        break;
        case 5:
            if (msg.body == "1"){
                msg.reply("Telefones de emergência:\n 199 - Defesa Civil\n 193 - Corpo de Bombeiros\n 190 - Policia Militar\n (XX) XXXX-XXXXX - Prefeitura\n ")
                msg.reply("Mantenha a calma, se possivel, deixe o local imediatamente e vá para um local seguro pois novos deslizamentos podem acontecer a qualquer momento.\n Você precisa de alguma ajuda adicional?")
                msg.reply("1 - Preciso de um local para ficar.\n2 - Preciso de material para arrumar minha casa.\n3 - Preciso de alimento ou água.\n4 - Preciso de outro tipo de ajuda")
                caminhos = 6;
            }
            else if(msg.body == "2"){
                msg.reply("Autoriza que esses dados sejam enviados para a defesa civil para a abertura de protocolo sobre sua situação?\n1 - Sim\n2 - Não")
            caminhos = 7;
            }
        break;
        case 6:
            switch(msg.body){
            case "1":
                    msg.reply("Dirija se a XXXX no Endereço XXXX")
                    msg.reply("Obrigado por entrar em contato!")
            break;
            case "2":
                    msg.reply("Dirija-se ao galpão da prefeitura no endereço XXXX")
                    msg.reply("Obrigado por entrar em contato!")
            break;
             case "3":
                    msg.reply("Dirija-se ao centro de distribuição no endereço XXX")
                    msg.reply("Obrigado por entrar em contato!")
            break;
            case "4":
                    msg.reply("Escreva do que está precisando e assim que possivel retornaremos")
            break;
            }
            caminhos = 0
        break;
        case 7:
            if(msg.body == "1"){
                msg.reply("Adicine as fotos e/ou Videos!")
            }
            msg.reply("Gostaria de receber dicas para minimizar o problema de deslizamento?\n1 - Sim\n2 - Não" )
            caminhos = 8;
        break;
        case 8:
            if(msg.body == "1"){
                msg.reply("Voce foi cadastrado para receber as dicas.")
            }
            caminhos = 0
            msg.reply("Obrigado por entrar em contato!")
        break;
        case 9:
            msg.reply("Agradecemos a sua disponibilidade. Entraremos em contato quando houver a necessidade.")
        break;
        default:
            msg.reply("Obrigado por entrar em contato!")
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
