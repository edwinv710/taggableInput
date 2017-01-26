var TaggableInput = ( function() {

  var defaults = {
    labelClass          : 'simple',
    labelContainerClass : 'taggable-label',
    containerClass      : 'taggable-input',
    close               : '<span>x</span>'
  };
  
  var defaultDelimiter = { keycode: [ 13 ], separator: undefined };

  var inputCache    = {};
  var booleanValues = {
    true:  [ 't', 'true' , '1', 1, true  ],
    false: [ 'f', 'false', '0', 0, false ]
  };
  
  var events = {
    beforeInsert : function ( text, index ) { return text; },
    afterInsert  : function ( label, index, text ) { }
  };

  var createElementFromString = function( element ) {
    console.log( element );
    if ( element instanceof HTMLElement ) return element;
    var parent = document.createElement('div');
    parent.innerHTML = element;
    console.log( parent );
    return parent.childNodes[0];
  };

  var attachDragListeners = function ( taggableInput ) {
    var dragged;
    var reference;
    
    taggableInput.container.addEventListener("dragstart", function( event ) {
      dragged   = event.target;
      reference = dragged.nextSibling;
      dragged.style.opacity = .7;
    }, false);

    taggableInput.container.addEventListener("dragend", function( event ) {
      dragged.style.opacity = "";
      dragged = undefined;
      reference = undefined;
      taggableInput._reset();
    }, false);

    taggableInput.container.addEventListener("dragenter", function( event ) {
      if ( !dragged ) return;
      if( !taggableInput.container.contains(event.target) )  
        dragged.parentNode.insertBefore( dragged, reference );
      else if ( event.target.className.includes("ti-label-drop") && !event.target.previousElementSibling ) 
        event.target.parentNode.parentNode.insertBefore( dragged, event.target.parentNode);
      else if ( event.target.className.includes("ti-label-drop") )
        event.target.parentNode.parentNode.insertBefore( dragged, event.target.parentNode.nextSibling);
    }, false);

    taggableInput.container.addEventListener("dragleave", function( event ) {
      if ( !dragged ) return;
      if ( taggableInput.container === event.target ) dragged.parentNode.insertBefore( dragged, reference );
    }, false);
    
    taggableInput.container.addEventListener("drop", function( event ) {
      event.preventDefault();
    }, false);
  };
   
  var embedTaggableInput = function(){
    var elements = document.querySelectorAll('.'+defaults.containerClass+':not([data-complete="true"])');
    for ( var i = 0; i < elements.length; i++ ) {
      var attributes = [].reduce.apply(  elements[ i ].attributes, [ function( obj, attr ) {
        if ( attr.name.includes( 'data-' ) )
          obj[ attr.name.replace('data-', '').replace(/(\-\w)/, function ( matches ) {
            return matches[1].toUpperCase() 
          } ) ]  = attr.value;
        return obj;
      }, {} ]);
      var taggableInput  =  new TaggableInput( elements[i], attributes ); 
      
    }
  }

  var parseValues    = function ( val ) {
    if ( typeof val === 'string' ) val  = val.split(',');
    return val;
  }
  
  var parseDelimiters = function ( del ) {
    del           = [].concat.apply( [], [ del ] );
    var delimiter = { keycode: [], separator: [] };
    for ( var i = 0; i < del.length; i++ ){
      if      ( typeof del[ i ] === 'number' ) delimiter.keycode.push( del[i] )
      else if ( typeof del[i] === 'string'   ) delimiter.separator.push( del[i] );
    }
    if ( delimiter.keycode.length === 0 && delimiter.separator.length === 0 ) return defaultDelimiter; 
    delimiter.separator = delimiter.separator.length ? new RegExp( delimiter.separator.join('|') ) : defaultDelimiter.separator;
    return delimiter;
  };


  var createContainer = function( container, input ) {
    if ( typeof container === 'string' ) container = document.getElementById( container );
    if ( ! (container instanceof HTMLElement ) ) throw 'Please provide a valid container.';
    if ( container.nodeName === 'INPUT' ) { 
      container = document.createElement( 'div' );
      input.parentNode.insertBefore( container, input );
    }
    container.className = ' ' + defaults.containerClass;
    container.id = container.id || Math.random().toString(36).substring( 2, 18 ).toUpperCase();
    container.dataset.complete = true;
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
    var text  = label.getElementsByClassName('ti-label-content')[0].innerText;
    input.setAttribute( 'type', 'hidden' );
    input.name  = name+'['+index+']';
    input.value = text; 
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

    input.className = input.className.replace(/(^| +)+taggable-input($| +)+/, ' ')
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

  var addEditableListeners = function ( content ) {
    content.setAttribute('contenteditable', true);
    content.addEventListener('keydown', function(e){
      if ( e.which === 13 ) e.preventDefault();
      else if ( e.which === 8 && this.innerText.length === 1 ) 
        this.parentNode.parentNode.parentNode.removeChild(this.parentNode);
    });
    content.addEventListener('blur', function(e) {
      var id      = this.parentNode.parentNode.getAttribute( 'data-cid' );
      var input   = inputCache[ id ]; 
      input.value = this.innerText;
    });
    ['keyup','mouseup','cut'].forEach( function( event ) { 
      content.addEventListener( event, function(e){
        if( this.innerHTML.length == 0 ) this.parentNode.parentNode.removeChild(this.parentNode); 
      });
    });
  };

  var addCloseListeners = function ( taggableInput, labelBody ) {
    var closeNode = document.createElement( 'div' );
    closeNode.className = 'ti-label-close';
    closeNode.appendChild( taggableInput.closeElement.cloneNode(true) );
    closeNode.addEventListener('click', function (e) {
      taggableInput.remove( labelBody.parentNode ); 
    });
    labelBody.appendChild( closeNode );
  };

  var createLabel = function( taggableInput, item ) {
    var id          = Math.random().toString(36).substr(2, 18).toUpperCase();
    var label       = document.createElement('div');
    label.className = defaults.labelContainerClass;
    label.innerHTML = "<div class='ti-label-drop'></div>"      + 
                      "<div class='ti-label-body'>"            +
                        "<div class='ti-label-content'></div>" +
                      "</div>"                                 +
                      "<div class='ti-label-drop'></div>"
    label.setAttribute ( 'data-cid', id ); 
    
    var content = label.getElementsByClassName('ti-label-content')[0];
    content.innerText = item;
    content.parentNode.className += ' '+taggableInput.labelClass;
    
    if ( taggableInput.editable ) addEditableListeners ( content ); 
    if ( taggableInput.close    ) addCloseListeners    ( taggableInput, content.parentNode );
    if ( taggableInput.draggable ) {
      label.setAttribute('draggable', 'true'); 
    }

    return label;
  };  

  var TaggableInput = function( container, opts ) {
    var opts   = opts || {};
    opts.label = opts.label || {};

    var values = parseValues( opts.values );
    this.labelClass   = opts.label.klass || opts.labelKlass ||  defaults.labelClass;
    this.closeElement = createElementFromString( opts.label.close || opts.labelClose ||  defaults.close );
    this.hiddenSpan   = createHiddenSpan();
    this.delimiter    = parseDelimiters(  opts.delimiter );
    this.editable     = !booleanValues.false.includes( opts.editable );
    this.draggable    = !booleanValues.false.includes( opts.draggable );
    this.close        = !booleanValues.false.includes( opts.close );
    this.backspace    = !booleanValues.false.includes( opts.backspace );
    this.input        = createInput( this, container,  this.hiddenSpan );
    this.container    = createContainer( container, this.input );
    this.id           = this.container.id;

    if  ( this.draggable  ) attachDragListeners( this );
    if  ( this.input.name ) this.name = this.input.name; 
    for ( var i in events ) this[ i ] = opts[ i ] || events[ i ];

    build ( this.container, this.input, this.hiddenSpan );
    TaggableInput.elements [ this.id ] = this;
    this.add ( values );
  };

  TaggableInput.prototype = {
    add : function( labels ) {
      var length = this.tags().length;
      labels = [].concat.apply( [], [ labels ] );
      for ( var i = 0; i < labels.length; i++ ) {
        if ( ! ( typeof labels[i] === 'string' && labels[i].length ) ) continue;
        labels[i] = this.beforeInsert( labels[i] );
        labels[i] = createLabel( this, labels[i] );
        this.container.insertBefore( labels[i] , this.input );
        this.afterInsert( labels[i] );
        if ( !this.name ) continue;
        var hiddenInput = createHiddenInput( this.name, length, labels[i] );
        this.container.appendChild( hiddenInput );
      }
    },
    remove : function( label ) {
      if ( typeof label === 'number' ) label = this.tags( label );
      if ( !label ) return;
      label.parentNode.removeChild( label );
      this._reset();
      return label;
    },
    pop : function() { 
      var label = this.remove( -1 ); 
      return label; 
    },
    tags: function( index ) {
      var tags = this.container.getElementsByClassName( defaults.labelContainerClass );
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

  TaggableInput.elements = {};
  window.onload = function(){
    embedTaggableInput(); 
  }

  return TaggableInput;
})();

