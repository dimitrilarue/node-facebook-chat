Node Facebook Chat
==================
Simple Facebook Chat XMPP client

Dependencies
------------
Ubuntu :
```
sudo apt-get install libexpat1 libexpat1-dev libicu-dev
```

#Install

```
npm install facebook-chat
```

#Example

```javascript
var FacebookChat = require("facebook-chat");

var params = {
  facebookId : 'User Facebook ID',
  appId : 'Your Facebook application ID',
  appSecret : 'Your Facebook application secret',
  accessToken : 'User Facebook access token'
};

var facebookClient = new FacebookChat(params);

facebookClient.on('online', function(){
  //Get friend list
  facebookClient.roster();

  //Send a message
  facebookClient.send('-FACEBOOK_ID@chat.facebook.com', 'test');

  //Get a vcard
  facebookClient.vcard();

  //Get a friend vcard
  facebookClient.vcard('-FACEBOOK_ID@chat.facebook.com');
});

facebookClient.on('message', function(message){
  console.log(message);
});

facebookClient.on('presence', function(presence){
  console.log(presence);
});

facebookClient.on('roster', function(roster){
  console.log(roster);
});

facebookClient.on('vcard', function(vcard){
  console.log(vcard);
});

facebookClient.on('composing', function(from){
  console.log(from + ' compose a message');
});
```

#License

MIT
