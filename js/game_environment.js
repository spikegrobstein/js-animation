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
    this.entities = [];

    this.ticks = 0;
    this.lastTickAt = new Date().getTime();
    this.status = 'halted';

    this.bus.listen( 'entity.move', function( _name, entity ) {
      if ( entity.element && entity.display ) {
        this.movedEntityQueue.push( entity );
      }
    }.bind(this));

    this.bus.listen( 'entity.add', function( _name, entity ) {
      this.entities.push(entity);
      this.bus.push( 'entity.move', entity );
    }.bind(this));

    this.bus.listen( 'entity.element.add', function( _name, element ) {
      this.fieldElement.appendChild( element );
    }.bind(this));
  };

  GameEnvironment.prototype.run = function() {
    this.status = 'running';
    this.lastTickAt = new Date().getTime();
    this._run();
  }

  GameEnvironment.prototype._run = function() {
    if ( this.status == 'halted' ) { return; }
    this.ticks += 1;

    this.bus.push( 'env.step', [ this.ticks, new Date().getTime() - this.lastTickAt, new Date().getTime() ] )
    this.updateEntities();

    this.lastTickAt = new Date().getTime();
    requestAnimFrame( this._run.bind(this) );
  };

  GameEnvironment.prototype.stop = function() {
    this.status = 'halted'
  }

  GameEnvironment.prototype.updateEntities = function() {
    var entity;

    while (this.movedEntityQueue.length > 0) {
      entity = this.movedEntityQueue.shift();
      this.moveEntity( entity );
    }
  };

  GameEnvironment.prototype.moveEntity = function( entity ) {
    entity.element.style['transform'] = entity.element.style['-ms-transform'] = entity.element.style['-webkit-transform'] = 'translate3d(' + entity.x + 'px,' + entity.y + 'px,0) rotate(' + entity.angleRadians + 'rad)';

    entity.element.hidden = ! entity.display;
  };

  globals.GameEnvironment = GameEnvironment;

})(window);
