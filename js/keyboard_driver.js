(function( globals, document ) {
  var KeyboardDriver = function( messageBus ) {
    this.state = {};
    this.bus = messageBus;

    document.addEventListener( 'keydown', function(event) {
      var key = event.which,
          was_held = this.state[key];

      this.state[key] = true;

      // if it wasn't already held, then push a message that it was pressed.
      if ( ! was_held ) {
        this.bus.push( 'keyboard.down', { key: key, state: this.state } );
      }
    }.bind(this));

    document.addEventListener( 'keyup', function(event) {
      var key = event.which;

      this.state[key] = false;
      this.bus.push( 'keyboard.up', { key: key, state: this.state } );
    }.bind(this));
  };

  // handle a key
  // key can be a string representation of the key (eg: 'A')
  // if you use the string representation, for letters, use capital
  // or the integer ascii code for the key as used by the normal key events
  // fires down_callback on down and up_callback on up
  // it's up to the user to bind the callbacks as needed
  // TODO: maybe put callbacks into an object and add additional options like an object to bind to?
  KeyboardDriver.prototype.handle = function( key, downCallback, upCallback ) {
    if ( typeof key === 'string' ) {
      // do any necessary key translation from string to int
      key = key.charCodeAt(0);
    }

    if ( typeof downCallback === 'function' ) {
      this.bus.listen( 'keyboard.down', function( _name, payload ) {
        if ( payload.key == key ) {
          downCallback( payload.key, payload.state )
        }
      });
    }

    if ( typeof upCallback === 'function' ) {
      this.bus.listen( 'keyboard.up', function( _name, payload ) {
        if ( payload.key == key ) {
          downCallback( payload.key, payload.state )
        }
      });
    }
  };

  globals.KeyboardDriver = KeyboardDriver;

})( window, document );
