(function( globals, document ) {
  var KeyboardDriver = function( messageBus ) {
    this.keyboardState = {};
    this.bus = messageBus;

    this.actionState = {};
    this.keyMappings = {
      left: 37,
      right: 39
    };

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

  // action states
  // for tracking competing inputs
  // eg: left/right
  // name the action (eg: turn)
  // on keydown, .shift() the type into that action and broadcast new state
  // on keyup, remove that type from the action
  // when checking state, return the first element
  // I want to be notified of state changes... I don't really care what they are. I'll act upon state during each update.
  // keyboard.handle(':left', { action: 'turn', mode: 'left', down: 'player.turn.left', up: 'player.turn.left.stop' })

  KeyboardDriver.prototype.getMapping = function( key ) {
    return this.keyMappings[key.match(/^:(.+)$/)[1]];
  }

  KeyboardDriver.prototype.handle = function( key, options ) {
    if ( typeof key === 'string' ) {
      if ( key.length > 1 && key[0] == ':' ) {
        key = this.getMapping(key);
      } else {
        // do any necessary key translation from string to int
        key = key.charCodeAt(0);
      }
    }

    var action = options.action,
        mode   = options.mode,
        up     = Default.value(options.up, 'keyboard.state.change'),
        down   = Default.value(options.down, 'keyboard.state.change')

    this.bus.listen( 'keyboard.down', function( _name, payload ) {
      if (payload.key == key) {
        if ( typeof this.actionState[action] === 'undefined' ) {
          this.actionState[action] = [];
        }

        this.actionState[action].unshift(mode);

        this.bus.push( down, {
          key: key,
          keyboardState: this.keyboardState,
          actionState: this.actionState,
        } );
      }
    }.bind(this));

    this.bus.listen( 'keyboard.up', function( _name, payload ) {
      if (payload.key == key) {
        if ( typeof this.actionState[action] === 'undefined' ) {
          this.actionState[action] = [];
        }

        this.actionState[action].splice( this.actionState[action].indexOf(mode), 1 );

        this.bus.push( up, {
          key: key,
          keyboardState: this.keyboardState,
          actionState: this.actionState,
        } );
      }
    }.bind(this));

  };

  globals.KeyboardDriver = KeyboardDriver;

})( window, document );
