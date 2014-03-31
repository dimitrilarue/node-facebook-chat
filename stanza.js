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
    from : this.extractFbId(stanza.attrs.from)
  };

  if (stanza.attrs.type === 'unavailable') {
    presence.type = 'unavailable';
  };

  return presence;
};

/**
 * On message response
 * @param  {Object} stanza
 */
stanza.onMessage = function(stanza) {
  var message = {
    from: stanza.attrs.from,
    type: stanza.attrs.type
  };

  if (stanza.attrs.type === 'chat') {
    //Message
    if (stanza.children[0].name == "body") {
      message.body = stanza.children[0].children;
      return message;
    }

    //Compose
    if (stanza.children[0].name == "composing") {
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
  return from.substr(1, from.indexOf('@') - 1);
};
