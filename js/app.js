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
  })

  gameEnvironment.run();
})(window,document);
