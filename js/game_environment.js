window.requestAnimFrame = function(){
  return (
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(/* function */ callback){
      window.setTimeout(callback, 1000 / 60);
    }
  );
}();

(function(globals) {

  var GameEnvironment = function( fieldElement ) {
    this.fieldElement = fieldElement;
    this.bus = new MessageBus({ignore: ['keyboard.up', 'keyboard.down']});
    this.keyboard = new KeyboardDriver( this.bus );

    this.movedEntityQueue = [];
    this.entities = []; // every entity that we're tracking

    this.state = {}; // the current state of things ( used for logic )

    this.ticks = 0;
    this.lastTickAt = new Date().getTime();
    this.status = 'halted';

    // create Trash element
    this.trashElement = document.createElement('div');
    this.trashElement.style.display = 'none';
    this.fieldElement.appendChild( this.trashElement );

    this.trashCount = 0;

    this.bus.listen( 'entity.move', function( _name, entity ) {
      if ( entity.element && entity.display ) {
        this.movedEntityQueue.push( entity );
      }
    }.bind(this));

    this.bus.listen( 'entity.add', function( _name, entity ) {
      this.entities.push(entity);
      this.bus.push( 'entity.move', entity );
    }.bind(this));

    this.bus.listen( 'entity.destroy', function( _name, entity ) {
      this.moveToTrash( entity.element );
      this.entities.splice( this.entities.indexOf(entity) );
      delete entity;
    }.bind(this));

    this.bus.listen( 'entity.element.add', function( _name, element ) {
      this.fieldElement.appendChild( element );
    }.bind(this));

    this.bus.listen( 'state.set', function( _name, payload ) {
      this.setState( payload.action, payload.mode );
    }.bind(this));

    this.bus.listen( 'state.unset', function( _name, payload ) {
      this.unsetState( payload.action, payload.mode );
    }.bind(this));
  };

  GameEnvironment.prototype.configureKeyboard = function( config ) {
    var key, binding;
    for ( key in config ) {
      binding = config[key];
      this.keyboard.handle( key, binding );
    }
  };

  GameEnvironment.prototype.getState = function( action ) {
    return this.state[action] && this.state[action][0];
  };

  GameEnvironment.prototype.setState = function( action, mode ) {
    if ( typeof this.state[action] === 'undefined' ) {
      this.state[action] = [];
    }

    if ( this.state[action].indexOf( mode ) == -1 ) {
      this.state[action].unshift( mode );
    }

    this.bus.push( 'state.change', {
      action: action,
      mode: mode,
      current: this.getState( action ),
    });

    return this;
  }

  GameEnvironment.prototype.unsetState = function( action, mode ) {
    if ( typeof this.state[action] === 'undefined' ) {
      this.state[action] = [];
    }

    this.state[action].splice(
      this.state[action].indexOf( mode ),
      1
    );

    this.bus.push( 'state.change', {
      action: action,
      mode: mode,
      current: this.getState( action ),
    });

    return this;
  }

  GameEnvironment.prototype.moveToTrash = function( element ) {
    this.trashElement.appendChild( element );
    this.trashCount += 1;
  }

  GameEnvironment.prototype.emptyTrash = function() {
    this.trashElement.innerHTML = '';
    this.trashCount = 0;
  }

  GameEnvironment.prototype.run = function() {
    this.status = 'running';
    this.lastTickAt = new Date().getTime();
    this._run();
  }

  GameEnvironment.prototype._run = function() {
    if ( this.status == 'halted' ) { return; }
    this.ticks += 1;

    // tell everything to update
    this.bus.push( 'env.step', [
      this.ticks,                               // ticks
      new Date().getTime() - this.lastTickAt,   // timeDelta
      new Date().getTime(),                     // now
      this.state,
    ] );

    // updates the UI
    this.updateEntities();

    this.lastTickAt = new Date().getTime();
    requestAnimFrame( this._run.bind(this) );
  };

  GameEnvironment.prototype.stop = function() {
    this.status = 'halted'
  }

  // any entities that have been updated, move into place
  // an entity needs to fire off an entity.moved message in order to get added to this queue
  GameEnvironment.prototype.updateEntities = function() {
    var entity;

    while (this.movedEntityQueue.length > 0) {
      entity = this.movedEntityQueue.shift();
      this.moveEntity( entity );
    }
  };

  GameEnvironment.prototype.moveEntity = function( entity ) {
    entity.element.style['transform'] =
      entity.element.style['-ms-transform'] =
      entity.element.style['-webkit-transform'] =
      'translate3d(' + entity.x + 'px,' + entity.y + 'px,0) rotate(' + entity.angleRadians + 'rad)';

    entity.element.hidden = ! entity.display;
  };

  globals.GameEnvironment = GameEnvironment;

})(window);

