var TaggableInput = ( function() {

  var containerClass = 'taggable-input';
  var labelClass    =  'label';
  var defaultDelimiters = [ ' ' ];
  
  var events = {
    beforeInsert : function ( text, index ) { return text; },
    afterInsert  : function ( label, index, text ) { }
  };

  var addTags    = function ( tag2Input, hiddenSpan, delimiterRegex, input ) {
    var items = input.value.split( delimiterRegex );
    if ( items[ items.length - 1 ].length === 0 ) items.pop();
    tag2Input.add( items );
    input.value = '';
  }

  var inputChange = function ( tag2Input, hiddenSpan ) {
    var delimiter      = tag2Input.delimiter.join('|'); 
    var delimiterRegex = new RegExp( delimiter );
    return function( e ) {
      if ( delimiterRegex.test( this.value ) ) addTags( tag2Input, hiddenSpan,  delimiterRegex, this); 
      hiddenSpan.innerText = this.value;
      this.style.width = hiddenSpan.clientWidth + ( this.offsetWidth - this.clientWidth + 5 ) + 'px';
    };
  }
  
  var createContainer = function( container, input ) {
    if ( typeof container === 'string' ) container = document.getElementById( container );
    if ( ! (container instanceof HTMLElement ) ) throw 'Please provide a valid container.';
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

  var createInput = function( tag2Input, hiddenSpan ) {
    var input  = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('size', '1');
    input.addEventListener( 'input', inputChange( tag2Input, hiddenSpan ), true );
    input.addEventListener( 'paste', inputChange( tag2Input, hiddenSpan ), true );
    input.addEventListener( 'keyup', function( e ) {
      if ( e.which != 8 || this.value.length != 0 ) return;
      tag2Input.pop();
    });
    return input;
  };

  var build = function ( container, input, hiddenSpan ) {
    container.appendChild( hiddenSpan );
    container.appendChild( input );
  };

  var dropCallback = function ( isLeft ) {
    return function(e) {
      var item   = document.getElementById( e.dataTransfer.getData('item') );
      var parent = e.target.parentNode;
      var target = isLeft ? parent : parent.nextSibling;
      parent.parentNode.insertBefore( item, target );
      e.stopPropagation();
      return false;
    }
  }

  var createLabel = function( taggableInput, item ) {
    var outer   = document.createElement('div' );
    var left    = document.createElement('span');
    var content = document.createElement('span');
    var right   = document.createElement('span');
    
    outer.className = 'label close'
    outer.id          = 'label-' + Math.random().toString(36).substr(2, 18).toUpperCase();
    
    content.innerText = item;
    content.className = 'content';
    
    if ( taggableInput.editable ) {
      content.setAttribute('contenteditable', true);
      content.addEventListener('keydown', function(e){
        if ( e.which === 8 && this.innerHTML.length === 1 ) this.parentNode.parentNode.removeChild(this.parentNode);
      });
      ['keyup','mouseup','cut'].map( function( event ) { 
        content.addEventListener( event, function(e){
          if( this.innerHTML.length == 0 ) this.parentNode.parentNode.removeChild(this.parentNode); 
        });
      });
    }
  
    if ( taggableInput.removable ) {
      outer.className += ' close';
      right.addEventListener('click', function (e) {
        this.parentNode.parentNode.removeChild( this.parentNode); 
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
    
      left.addEventListener ('drop', dropCallback(true)  );
      right.addEventListener('drop', dropCallback(false) );

      outer.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('item', this.id );
        return true;
      });  
    }
    

    return outer;
  };  

  var TaggableInput = function( container, opts ) {
    var hiddenSpan = createHiddenSpan();
    this.delimiter = opts.delimiter  || defaultDelimiters;
    this.delimiter = this.delimiter instanceof Array ?  this.delimiter : [ this.delimiter ];
    this.delimiter = this.delimiter.map(function(item){ return item.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); });
    this.editable  = opts.editable != false;
    this.draggable = opts.draggable != false;
    this.removable = opts.removable != false;
    this.input     = createInput( this, hiddenSpan );
    this.container = createContainer( container, this.input );
  
    for ( var i in events ) this[ i ] = opts[ i ] || events[ i ];

    build( this.container, this.input, hiddenSpan );
  };

  TaggableInput.prototype = {
    add : function( labels ) {
      labels = ( labels instanceof Array ) ? labels : [ labels ];
      for ( var i = 0; i < labels.length; i++ ) {
        labels[i] = this.beforeInsert( labels[i] );
        labels[i] = createLabel( this, labels[i] );
        this.container.insertBefore( labels[i] , this.input);
        this.afterInsert( labels[i] );
      }
    },
    remove : function( label ) {
      if ( typeof label === 'number' ) label = this.tags( label );
      label.parentNode.removeChild( label );
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
  };
  return TaggableInput;
})();
