(function(globals, document) {

  var Entity = function( options ) {
    options = Default.value( options, {} );

    this.properties = Default.value( options.properties, {} );

    this.bus = Default.must( options.bus, "Must define a 'bus' option (MessageBus)")
    this.x = Default.must( options.x );
    this.y = Default.must( options.y );
    this.frameHandler = options.frameHandler;

    this.bus.listen( 'env.step', function( _name, payload ) {
      if ( typeof this.frameHandler === 'function' ) {
        this.frameHandler.apply( this, payload );
      }
    }.bind(this));

    this.display = true;

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
  }

  Entity.prototype.moveTo = function( x, y ) {
    this.x = x;
    this.y = y;
    this.bus.push( 'entity.move', this );
  };

  Entity.prototype.moveDelta = function( x, y ) {
    this.moveTo( this.x + x, this.y + y );
  };

  globals.Entity = Entity;

})(window, document);
