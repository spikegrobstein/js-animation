(function(globals, document) {

  window.gameEnvironment = new GameEnvironment( document.getElementById('game-field') );

  gameEnvironment.keyboard.handle( 'A', function(key, state) { console.log('pressed: ' + key) });
  gameEnvironment.keyboard.handle( 'B', function(key, state) { console.log('pressed: ' + key) });

  new Entity({
    x: 0,
    y: 50,
    bus: gameEnvironment.bus,
    class: 'rocket',
    properties: {
      rotation: 0
    },
    frameHandler: function( tick, timeDelta, now ) {
      // f(1000) = ( 300 * PI )
      // 942.4777961 per second (1000)
      // 942.4777961 / (1000 / timeDelta)
      // 942.47779
      // (150 * 2 * pi) / ( 1000 / timeDelta ) / ( 2 * pi )

      this.properties.rotation += ( timeDelta / 4000 ) * ( 2 * Math.PI );

      this.moveTo(
        200 + 150 * ( Math.cos( this.properties.rotation ) ),
        200 + 150 * ( Math.sin( this.properties.rotation ) ),
        true
      )
    }
  });

  new Entity({
    x: 50,
    y: 0,
    bus: gameEnvironment.bus,
    class: 'rocket',
    properties: {
      rotation: 0,
      xv: 50, // pixels per second
      yv: 0,
      bounces: 0
    },
    frameHandler: function( tick, timeDelta, now ) {
      this.properties.yv += 10;

      if ( this.y > 460 ) {
        this.properties.yv = -this.properties.yv * .9;
        this.properties.bounces += 1;

        if ( this.properties.bounces > 5 ) {
          this.destroy();
        }
      }

      if ( this.x > 500 || this.x < 0 ) {
        this.properties.xv = -this.properties.xv * .9;
      }

      this.moveDelta(
        timeDelta / 1000 * this.properties.xv,
        timeDelta / 1000 * this.properties.yv,
        true
      )
    }
  });

  new Entity({
    x: 152,
    y: 152,
    bus: gameEnvironment.bus,
    class: 'gun',
    angleRadians: - Math.PI/2,
    properties: {
      rotateRate: 0, // not rotating
      rotateDirection: 0,
      maxRotateRate: 0.1
    },
    onInit: function( ) {

      gameEnvironment.keyboard.handle(':left', {
        action: 'turn',
        mode: 'left'
      });

      gameEnvironment.keyboard.handle(':right', {
        action: 'turn',
        mode: 'right'
      })

      this.bus.listen( 'keyboard.state.change', function( _name, payload ) {
        if ( payload.kb.action('turn') == 'left' ) {
          this.properties.rotateDirection = -1;
        } else if ( payload.kb.action('turn') == 'right' ) {
          this.properties.rotateDirection = 1;
        } else {
          this.properties.rotateDirection = 0;
        }
      }.bind(this));
    },
    frameHandler: function( tick, timeDelta, now ) {
      this.properties.rotateRate += this.properties.rotateDirection * 0.01;

      if ( this.properties.rotateDirection == 0 ) {
        this.properties.rotateRate = 0;
      } else if ( this.properties.rotateRate >= this.properties.maxRotateRate ) {
        this.properties.rotateRate = this.properties.maxRotateRate;
      } else if ( this.properties.rotateRate <= -this.properties.maxRotateRate ) {
        this.properties.rotateRate = -this.properties.maxRotateRate;
      }

      this.angleRadians += this.properties.rotateRate;
      if ( this.angleRadians < -Math.PI - 0.25 ) {
        this.angleRadians = -Math.PI - 0.25;
      } else if ( this.angleRadians > 0.25 ) {
        this.angleRadians = 0.25;
      }

      this.bus.push( 'entity.move', this );
    }
  });


  gameEnvironment.run();
})(window,document);
