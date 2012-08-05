var util = require('util'),
    xmpp = require('node-xmpp'),
    EventEmitter = require('events').EventEmitter,
    stanzaUtils = require("./stanza");

exports = module.exports = FacebookChat;

/**
 * Facebook chat client
 * @param params  Required params for connection
 * @param params.facebookId  User Facebook ID
 * @param params.accessToken  User Facebook access token
 * @param params.appId  Your Facebook application ID
 * @param params.appSecret  Your Facebook application secret
 */
function FacebookChat(params) {
  EventEmitter.call(this);

  var self = this;

  //Connect the client
  this.client = new xmpp.Client({
    jid: '-'+ params.facebookId +'@chat.facebook.com',
    api_key: params.appId,
    secret_key: params.appSecret,
    access_token: params.accessToken
  });

  //If a error is receive
  this.client.on('error', function(err){
    self.emit('error', err);
  });

  //When Online
  this.client.on('online', function(){
    self.emit('online');

    //Send Presence
    var presence = new xmpp.Element('presence');
    self.client.send(presence);

    //And keep the connection live
    setInterval(function(){
      self.client.send(presence);
    }, 1000 * 20);
  });

  //On stanza from facebook
  this.client.on('stanza', function(stanza) {
    if (stanza.is('iq')) {
      var iq = stanzaUtils.onIq(stanza);

      //Roster
      if (iq && iq.type === 'jabber:iq:roster') {
        self.emit('roster', iq.friends);
      }

      //vCard
      if (iq && iq.type === 'vcard') {
        self.emit('vcard', iq.vcard);
      }
    }
    //Presence
    else if(stanza.is('presence')) {
      var presence = stanzaUtils.onPresence(stanza);
      self.emit('presence', presence);
    }
    //Message
    else if(stanza.is('message')) {
      var message = stanzaUtils.onMessage(stanza);

      //Message
      if (message && message.body) {
        self.emit('message', message);
      }

      //Composing message
      if (message && message.composing) {
        self.emit('composing', message.from);
      }
    }
  });

}
util.inherits(FacebookChat, EventEmitter);

/**
 * Send a roster request (friend list)
 */
FacebookChat.prototype.roster = function() {
  this.client.send(
    new xmpp.Element( 'iq', { type: 'get' })
    .c('query', { xmlns: 'jabber:iq:roster'})
  );
};

/**
 * Send a message
 * @param  {String} to  -FACEBOOK_ID@chat.facebook.com
 * @param  {String} message  plain-text messages
 */
FacebookChat.prototype.send = function(to, message) {
  this.client.send(stanzaUtils.message(to, message));
};

/**
 * Send a vcard request
 * @param  {String} [to]
 */
FacebookChat.prototype.vcard = function(to) {
  var params = { type: 'get' };
  if (to) {
    params.to = to;
  }

  this.client.send(
    new xmpp.Element( 'iq', params)
    .c('vCard', { xmlns: 'vcard-temp'})
    .c('want-extval', { xmlns: 'http://www.facebook.com/xmpp/vcard/photo'})
  );
};