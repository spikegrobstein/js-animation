(function(globals, document) {

  var Entity = function( options ) {
    options = Default.value( options, {} );

    this.properties = Default.value( options.properties, {} );

    this.bus = Default.must( options.bus, "Must define a 'bus' option (MessageBus)")

    this.x = Default.must( options.x );
    this.y = Default.must( options.y );
    this.angleRadians = Default.value( options.angleRadians, 0 );

    this.frameHandler = options.frameHandler;

    this.bus.listen( 'env.step', function( _name, payload ) {
      if ( typeof this.frameHandler === 'function' ) {
        this.frameHandler.apply( this, payload );
      }
    }.bind(this));

    this.display = true;
    this._deleted = false;

    this._buildElement( options.class );

    this.bus.push( 'entity.add', this );
  };

  Entity.prototype._buildElement = function( klass ) {
    this.element = document.createElement('div');

    this.element.setAttribute( 'class', klass );
    this.element.hidden = true;

    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    this.bus.push( 'entity.element.add', this.element );
  };

  Entity.prototype.destroy = function() {
    //if ( this._deleted ) { return; }

    // destroy the element
    this._deleted = true;
    // remove from environment
    this.bus.push( 'entity.destroy', this );
  };

  Entity.prototype.moveTo = function( x, y, doRotation ) {
    if ( doRotation ) {
      // set the angle to point this in the right direction
      this.angleRadians = Math.atan2((this.y - y), (this.x - x)) + Math.PI;
    }

    this.x = x;
    this.y = y;
    this.bus.push( 'entity.move', this );
  };

  Entity.prototype.moveDelta = function( x, y, doRotation ) {
    this.moveTo( this.x + x, this.y + y, doRotation );
  };

  globals.Entity = Entity;

})(window, document);
