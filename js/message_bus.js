(function(globals) {

  // a bus for sending messages
  // push data in with a name and tag
  // clients can listen for messages with that name

  var MessageBus = function( options ) {
    this.listeners = {};
  };

  MessageBus.prototype.listen = function( name, callback ) {
    this.addListener( name, callback );

    return this;
  }

  MessageBus.prototype.addListener = function( name, callback ) {
    if ( typeof this.listeners[name] === 'undefined' ) {
      this.listeners[name] = [];
    }

    this.listeners[name].push( callback );

    return this;
  }

  MessageBus.prototype.push = function( name, data ) {
    var listeners = this.listeners[name],
        i;

    if ( typeof listeners === 'undefined' ) {
      if ( ! name.match(/^keyboard/) ) {
        console.warn('Got message: ' + name + ' but with no listeners!');
      }
      return this;
    }

    for ( i in listeners ) {
      listeners[i]( name, data );
    }

    return this;
  }

  globals.MessageBus = MessageBus;

})(window);
