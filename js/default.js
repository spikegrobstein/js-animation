(function(globals) {
  var Default = {
    value: function( v, default_value ) {
      if ( typeof v === 'undefined' ) {
        return default_value;
      }

      return v;
    },
    must: function( v, message ) {
      if ( typeof message === 'undefined' ) {
        message = "Missing required parameter."
      }

      if ( typeof v === 'undefined' ) {
        throw message;
      }

      return v;
    }
  };

  globals.Default = Default;
})(window);
