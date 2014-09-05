(function(globals, document) {

  window.gameEnvironment = new GameEnvironment( document.getElementById('game-field') );

  gameEnvironment.keyboard.handle( 'A', function(key, state) { console.log('pressed: ' + key) });
  gameEnvironment.keyboard.handle( 'B', function(key, state) { console.log('pressed: ' + key) });

  var e = new Entity({
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
        200 + 150 * ( Math.sin( this.properties.rotation ) )
      )
    }
  });

  gameEnvironment.run();
})(window,document);
