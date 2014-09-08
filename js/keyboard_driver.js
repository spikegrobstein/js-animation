(function( globals, document ) {
  var defaultMappings = {
    left: 37,
    right: 39,
    up: undefined,
    down: undefined,
    leftShift: undefined,
    rightShift: undefined,
  };

  var KeyboardDriver = function( messageBus, options ) {

    options = Default.value( options, {} );
    options.keyMappings = Default.value( options.keyMappings, defaultMappings );

    this.keyboardState = {};
    this.bus = messageBus;

    this.keyMappings = options.keyMappings;
    this.actionMappings = {};

    document.addEventListener( 'keydown', function(event) {
      var key = event.which,
          was_held = this.keyboardState[key];

      // this.state[key] = true;

      // if it wasn't already held, then push a message that it was pressed.
      if ( ! was_held ) {
        this.keyboardState[key] = new Date().getTime();
        this.bus.push( 'keyboard.down', { key: key, state: this.keyboardState } );
      }
    }.bind(this));

    document.addEventListener( 'keyup', function(event) {
      var key = event.which;

      this.keyboardState[key] = false;
      this.bus.push( 'keyboard.up', { key: key, state: this.keyboardState } );
    }.bind(this));
  };

  KeyboardDriver.prototype.getKeyMapping = function( key ) {
    return this.keyMappings[key.match(/^:(.+)$/)[1]];
  }

  KeyboardDriver.prototype.handle = function( key, options ) {
    if ( typeof key === 'string' ) {
      if ( key.length > 1 && key[0] == ':' ) {
        key = this.getKeyMapping(key);
      } else {
        // do any necessary key translation from string to int
        key = key.charCodeAt(0);
      }
    }

    var action = options.action,
        mode   = options.mode,
        down   = Default.value(options.down, 'state.set'),
        up     = Default.value(options.up, 'state.unset');

    this.bus.listen( 'keyboard.down', function( _name, payload ) {
      if (payload.key == key) {
        this.bus.push( down, { action: action, mode: mode } );
      }
    }.bind(this));

    this.bus.listen( 'keyboard.up', function( _name, payload ) {
      if (payload.key == key) {
        this.bus.push( up, { action: action, mode: mode } );
      }
    }.bind(this));

  };

  globals.KeyboardDriver = KeyboardDriver;

})( window, document );
