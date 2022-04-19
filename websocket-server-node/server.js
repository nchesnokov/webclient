const WebSocket = require('ws');

const fs = require('fs');

const path = require('path');

let p = __dirname.split(path.sep)
const save_path = '/' +path.join(...p.slice(0,p.length-1))
//console.log('save path:',save_path)
const wsServer = new WebSocket.Server({port: 9000});

wsServer.on('connection', onConnect);

function onConnect(wsClient) {
  //console.log('Новый пользователь');
  // отправка приветственного сообщения клиенту
  wsClient.send('Connnected');
wsClient.on('message', function(message) {
    /* обработчик сообщений от клиента */

    try {
  // сообщение пришло текстом, нужно конвертировать в JSON-формат
  const jsonMessage = JSON.parse(message);
  //console.log('message:',jsonMessage)
  switch (jsonMessage.action) {
    case 'ECHO':
      wsServer.send(jsonMessage.data);
      break;
    case 'PING':
      setTimeout(function() {
        wsServer.send('PONG');
      }, 2000);
      break;
    case 'PUT':
		fs.writeFile(path.join(save_path,'src','components',jsonMessage.name), jsonMessage.data, (err) => {
        if(err) throw err;
			//console.log('Data has been replaced! '+jsonMessage.name);
			wsClient.send(JSON.stringify({'ONPUT':jsonMessage.name}))
		});		
		break;
    case 'STAT':
		fs.stat(path.join(save_path,'src','components',jsonMessage.name), jsonMessage.data, (error, stats) => {
		if (error) {
			console.log(error);
			wsClient.send(JSON.stringify({'ONSTAT':{}}))
		}
		  else {
			wsClient.send(JSON.stringify({'ONSTAT':stats}));
		  }
	  });
	  break;
    default:
      console.log('Неизвестная команда',jsonMessage);
      break;
  }
} catch (error) {
  console.log('Ошибка', error);
}
  })

  wsClient.on('close', function() {
    // отправка уведомления в консоль
    console.log('Пользователь отключился');
  });
}
