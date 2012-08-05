//@TODO Implement real unit test
var FacebookChat = require("./index");
var params = {
  facebookId : 'User Facebook ID',
  appId : 'Your Facebook application ID',
  secret_key : 'Your Facebook application secret',
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
