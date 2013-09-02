var Element = require('node-xmpp').Element;

/**
 * Stanza Utils
 * @type {Object}
 */
var stanza = module.exports = {};

/**
 * On iq response
 * @param  {Object} stanza
 */
stanza.onIq = function(stanza) {
  if (stanza.type !== 'result') return;

  var iq = {};

  //If is result query
  var query = stanza.getChild('query');
  if (query) {
    var ns = query.getNS();
    iq.type = ns;

    if (ns === 'jabber:iq:roster') {
      iq.friends = [];
      var friends = query.getChildren('item');

      friends.forEach(function(friend){
        iq.friends.push({
          id: friend.attrs.jid,
          name: friend.attrs.name
        });
      });
    }
  }

  //If is a result vcard
  var vcard = stanza.getChild('vCard');
  if (vcard) {
    iq.type = 'vcard';
    iq.vcard = {
      name: vcard.getChild('FN').getText(),
      from: stanza.from,
      photo: typeof vcard.getChild('PHOTO').getChild('EXTVAL') !== 'undefined' ? vcard.getChild('PHOTO').getChild('EXTVAL').getText() : ''
    };
  }

  return iq;
};

/**
 * On presence response
 * @param  {Object} stanza
 */
stanza.onPresence = function(stanza) {
  var presence = {
    from : stanza.from
  };

  if (stanza.type === 'unavailable') {
    presence.type = 'unavailable';
  }

  var x = stanza.getChild('x');
  var photoHash = x ? x.getChild('photo').getText() : false;
  if (photoHash) {
    presence.photoHash = photoHash;
  }

  return presence;
};

/**
 * On message response
 * @param  {Object} stanza
 */
stanza.onMessage = function(stanza) {
  var message = {
    from: stanza.from,
    type: stanza.type
  };

  if (stanza.type === 'chat') {
    //Message
    var body = stanza.getChild('body');
    if (body) {
      message.body = body.getText();
      return message;
    }

    //Compose
    var composing = stanza.getChild('composing');
    if (composing) {
      message.composing = true;
      return message;
    }
  }

  return;
};

/**
 * Make a stanza message
 * @param  {String} to
 * @param  {String} message
 * @return {Object}
 */
stanza.message = function(to, message) {
  var stanza = new Element('message', { to: to, type: 'chat' });
  stanza.c('body').t(message);
  return stanza;
};


stanza.extractFbId = function(from) {
  return from.substr(1, from.indexOf('@'));
};
