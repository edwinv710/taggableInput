var TaggableInput = ( function() {

  var containerClass = 'taggable-input';
  var labelClass    =  'label';
  var defaultDelimiter = { keycode: [ 13 ], separator: undefined };

  var inputCache = {};
  
  var events = {
    beforeInsert : function ( text, index ) { return text; },
    afterInsert  : function ( label, index, text ) { }
  };
  
  var parseDelimiters = function ( del ) {
    var delimiter = { keycode: [], separator: [] };
    if ( !( del instanceof Array ) ) del = [ del ];
    for ( var i = 0; i < del; i++ ){
      if ( typeof del[ i ] === 'number' )    delimiter.keycode.push( del[i] )
      else if ( typeof del[i] === 'string' ) delimiter.separator.push( del[i] );
    }
    if ( delimiter.keycode.length === 0 && delimiter.separator.length === 0 ) return defaultDelimiter; 
    delimiter.separator = delimiter.sepatator.length ? new RegExp( delimiter.separator.join('|') ) : undefined;
    return delimiter;
  };


  var createContainer = function( container, input ) {
    if ( typeof container === 'string' ) container = document.getElementById( container );
    if ( ! (container instanceof HTMLElement ) ) throw 'Please provide a valid container.';
    if ( container.nodeName === 'INPUT' ) { 
      container = document.createElement( 'div' );
      input.parentNode.insertBefore( container, input );
    }
    container.className = ' '+containerClass;
    container.onclick   = function( e ) {
      if ( e.target !== this ) return;
      input.focus();
    }
    return container;
  };

  var createHiddenSpan = function() {
    var span  = document.createElement('span');
    var style = {
      position : 'absolute',
      display  : 'inline-block',
      height   : '0px',
      left     : '0',
      top      : '0',
      overflow : 'hidden' 
    }
    span.className = 'hiddenSpan';
    for ( var i in style ) span.style[i] = style[i];
    return span;
  };

  var createHiddenInput = function( name, index, label) {
    var input = document.createElement( 'input' );
    var id    = label.getAttribute( 'data-cid' );
    input.setAttribute( 'type', 'hidden' );
    input.name  = name+'['+index+']';
    input.value = label.innerText;
    inputCache[ id ] = input; 
    return input;
  }

  var inputChange = function ( tag2Input ) {
    return function( e ) {
      var regex = tag2Input.delimiter.separator;
      if ( regex && regex.test( this.value ) ) tag2Input._addTags(); 
      tag2Input._calibrateInput();
    };
  }
  
  var createInput = function( tag2Input, element,  hiddenSpan ) {
    var input; 

    if ( element.nodeName === 'INPUT' ) input = element;
    else input = document.createElement( 'input' );

    input.setAttribute('type', 'text');
    input.setAttribute('size', '1');
    input.addEventListener( 'input', inputChange( tag2Input ), true );
    input.addEventListener( 'paste', inputChange( tag2Input ), true );
    input.addEventListener( 'keydown', function( e ) {
      if ( e.which === 8 && this.value.length === 0 ) tag2Input.pop();
      else if ( tag2Input.delimiter.keycode.indexOf( e.which ) != -1 ) {
        tag2Input._addTags();
        tag2Input._calibrateInput();
      }
    });
    return input;
  };

  var build = function ( container, input, hiddenSpan ) {
    container.appendChild( hiddenSpan );
    container.appendChild( input );
    input.removeAttribute('name');
  };

  var dropCallback = function ( isLeft, taggableInput ) {
    return function(e) {
      var item   = document.getElementById( e.dataTransfer.getData('item') );
      var parent = e.target.parentNode;
      var target = isLeft ? parent : parent.nextSibling;
      parent.parentNode.insertBefore( item, target );
      taggableInput._reset();
      e.stopPropagation();
      return false;
    }
  }

  var createLabel = function( taggableInput, item ) {
    var id      = Math.random().toString(36).substr(2, 18).toUpperCase();
    var outer   = document.createElement('div' );
    var left    = document.createElement('span');
    var content = document.createElement('span');
    var right   = document.createElement('span');
    
    outer.setAttribute ( 'data-cid', id ); 
    outer.className = 'label close'
    outer.id        = 'label-' + id;id 

    content.innerText = item;
    content.className = 'content';
    
    if ( taggableInput.editable ) {
      content.setAttribute('contenteditable', true);
      content.addEventListener('keydown', function(e){
        if ( e.which === 8 && this.innerHTML.length === 1 ) this.parentNode.parentNode.removeChild(this.parentNode);
      });
      ['keyup','mouseup','cut'].forEach( function( event ) { 
        content.addEventListener( event, function(e){
          if( this.innerHTML.length == 0 ) this.parentNode.parentNode.removeChild(this.parentNode); 
        });
      });
    }
  
    if ( taggableInput.removable ) {
      outer.className += ' close';
      right.addEventListener('click', function (e) {
        taggableInput.remove( this.parentNode ); 
      });
    }

    left.className  = 'drop-left';
    left.innerHTML  = '&nbsp;'
    right.innerHTML = '&nbsp;'
    right.className = 'drop-right';
    
    outer.appendChild( left    );
    outer.appendChild( content );
    outer.appendChild( right   );

    if ( taggableInput.draggable ) {
      outer.setAttribute('draggable', 'true');
      left.addEventListener ('dragenter', function (e) { e.preventDefault(); return true; });
      right.addEventListener('dragenter', function (e) { e.preventDefault(); return true; });
      left.addEventListener ('dragover' , function (e) { e.preventDefault(); return true; });
      right.addEventListener('dragover' , function (e) { e.preventDefault(); return true; });
    
      left.addEventListener ('drop', dropCallback( true, taggableInput  ) );
      right.addEventListener('drop', dropCallback( false, taggableInput ) );

      outer.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('item', this.id );
        return true;
      });  
    }
    

    return outer;
  };  

  var TaggableInput = function( container, opts ) {
    var opts = opts || {};
    this.hiddenSpan = createHiddenSpan();
    this.delimiter = parseDelimiters(  opts.delimiter );
    this.editable  = opts.editable != false;
    this.draggable = opts.draggable != false;
    this.removable = opts.removable != false;
    this.input     = createInput( this, container,  this.hiddenSpan );
    this.container = createContainer( container, this.input );
    if ( this.input.name ) this.name = this.input.name; 
    for ( var i in events ) this[ i ] = opts[ i ] || events[ i ];

    build( this.container, this.input, this.hiddenSpan );
  };

  TaggableInput.prototype = {
    add : function( labels ) {
      var length = this.tags().length;
      labels = ( labels instanceof Array ) ? labels : [ labels ];
      for ( var i = 0; i < labels.length; i++ ) {
        labels[i] = this.beforeInsert( labels[i] );
        labels[i] = createLabel( this, labels[i] );
        this.container.insertBefore( labels[i] , this.input);
        this.afterInsert( labels[i] );
        if ( this.name ) { 
          var hiddenInput = createHiddenInput( this.name, length, labels[i] );
          this.container.appendChild( hiddenInput );
        } 
      }
    },
    remove : function( label ) {
      if ( typeof label === 'number' ) label = this.tags( label );
      label.parentNode.removeChild( label );
      this._reset();
      return label;
    },
    pop : function() { 
      var label = this.remove( -1 ); 
      return label; 
    },
    tags: function( index ) {
      var tags = this.container.getElementsByClassName( labelClass );
      if ( !index ) return tags;
      index = ( tags.length + index ) % tags.length;
      return tags[index];
    },
    values: function() {
      var labels = this.container.getElementsByClassName('label');
      return [].map.call( labels, function( item ) { return item.innerText; } );
    },
    _reset: function() {
      if ( this.name ) {
        var tags = this.tags();
        var newCache = {};
        for ( var i = 0; i < tags.length; i++ ) {
          var id              = tags[i].getAttribute( 'data-cid' );
          newCache[ id ]      = inputCache[ id ];
          newCache[ id ].name = this.name + '[' + i + ']'; 
          inputCache[ id ].parentNode.appendChild( inputCache[ id ] );
          delete inputCache[ id ];
        }
        for ( var key in inputCache ){
          if ( !inputCache.hasOwnProperty( key ) ) continue; 
          var value = inputCache[ key ];
          value.parentElement.removeChild( value );
        }
        inputCache = newCache;
      }
    },
    _addTags: function () {
      var items = this.input.value.split( this.delimiter.separator );
      if ( items[ items.length - 1 ].length === 0 ) items.pop();
      this.add( items );
      this.input.value = '';
    },
    _calibrateInput: function() {
      this.hiddenSpan.innerText = this.input.value;
      this.input.style.width = this.hiddenSpan.clientWidth + ( this.input.offsetWidth - this.input.clientWidth + 5 ) + 'px';
    }
  }
  return TaggableInput;
})();
