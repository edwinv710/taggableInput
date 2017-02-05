var TaggableInput = ( function() {

  var defaults = {
    tagClass          : 'simple',
    tagContainerClass : 'ti-tag',
    containerClass    : 'taggable-input',
    close             : '<span>x</span>',
    delimiters        : { keycode: [ 32 ], separator: undefined },
    booleans          : {
      true:  [ 't', 'true' , '1', 1, true  ],
      false: [ 'f', 'false', '0', 0, false ]
    },
    events            : {
      beforeInsert : function ( text ) { return text; },
      afterInsert  : function ( tag, text, index ) { }
    }
  };
  
  var inputCache    = {};
  
  var createElementFromString = function( element ) {
    if ( element instanceof HTMLElement ) return element;
    var parent = document.createElement('div');
    parent.innerHTML = element;
    return parent.childNodes[0];
  };

  var createTagElement = function ( text ) {
    var id        = Math.random().toString(36).substr(2, 18).toUpperCase();
    var tag       = document.createElement('div');
    tag.className = defaults.tagContainerClass;
    tag.innerHTML = "<div class='ti-tag-drop'></div>"                + 
                    "<div class='ti-tag-drop'></div>"                +
                    "<div class='ti-tag-body'>"                      +
                      "<span class='ti-tag-content'>"+text+"</span>" +
                    "</div>"                               
    tag.setAttribute ( 'data-cid', id ); 
    
    return tag;
  }

  var attachDragListeners = function ( taggableInput ) {
    var dragged;
    var reference;
    
    taggableInput.container.addEventListener("dragstart", function( event ) {
      dragged   = event.target;
      reference = dragged.nextSibling;
      dragged.className += ' active';
    }, false);

    taggableInput.container.addEventListener("dragend", function( event ) {
      dragged.className = dragged.className.replace( /(^|\s)active/, '' );
      dragged = undefined;
      reference = undefined;
      taggableInput._reset();
    }, false);

    taggableInput.container.addEventListener("dragenter", function( event ) {
      if ( !dragged ) return;
      if ( !taggableInput.container.contains(event.target) )  
        dragged.parentNode.insertBefore( dragged, reference );
      else if ( event.target.className.includes("ti-tag-drop") && !event.target.previousElementSibling ) 
        event.target.parentNode.parentNode.insertBefore( dragged, event.target.parentNode);
      else if ( event.target.className.includes("ti-tag-drop") )
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
      console.log( 'attributes' );
      console.log( attributes );
      var taggableInput  =  new TaggableInput( elements[i], attributes ); 
    }
  };

  var parseValues = function ( val ) {
    if ( typeof val === 'string' ) val = val.split(',');
    return val;
  };
  
  var parseDelimiters = function ( del ) {
    del           = [].concat.apply( [], [ del ] );
    var delimiter = { keycode: [], separator: [] };
    for ( var i = 0; i < del.length; i++ ){
      if      ( !isNaN( del[ i ] ) ) delimiter.keycode.push( parseInt( del[i] ) )
      else if ( typeof del[i] === 'string'   ) delimiter.separator.push( del[i] );
    }
    if ( delimiter.keycode.length === 0 && delimiter.separator.length === 0 ) return defaults.delimiters; 
    delimiter.separator = delimiter.separator.length ? new RegExp( delimiter.separator.join('|') ) : defaults.delimiters.separator;
    return delimiter;
  };


  var createContainer = function( container, input ) {
    if ( typeof container === 'string' ) container = document.getElementById( container );
    if ( ! (container instanceof HTMLElement ) ) throw 'Please provide a valid container.';
    if ( container.nodeName === 'INPUT' ) { 
      container = document.createElement( 'div' );
      input.parentNode.insertBefore( container, input );
    }
    container.className = container.className.replace( defaults.containerClass, '' ) + ' ' + defaults.containerClass;
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

  var createHiddenInput = function( name, index, tag) {
    var input = document.createElement( 'input' );
    var id    = tag.getAttribute( 'data-cid' );
    var text  = tag.getElementsByClassName('ti-tag-content')[0].textContent;
    input.setAttribute( 'type', 'hidden' );
    input.name  = name+'['+index+']';
    input.value = text; 
    inputCache[ id ] = input; 
    return input;
  };

  var inputChange = function ( tag2Input ) {
    return function( e ) {
      var regex = tag2Input.delimiter.separator;
      if ( regex && regex.test( this.value ) ) tag2Input._addTags(); 
      tag2Input._calibrateInput();
    };
  };
  
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
    container.appendChild( input      );
    input.removeAttribute( 'name'     );
  };

  var addEditableListeners = function ( content ) {
    content.parentNode.parentNode.className += ' ti-editable';
    content.setAttribute( 'contenteditable', true );
    content.addEventListener( 'keydown', function(e) {
      if ( e.which === 13 ) e.preventDefault();
      else if ( e.which === 8 && this.textContent.length === 1 ) 
        this.parentNode.parentNode.parentNode.removeChild(this.parentNode);
    });
    content.addEventListener( 'blur', function(e) {
      var id      = this.parentNode.parentNode.getAttribute( 'data-cid' );
      var input   = inputCache[ id ]; 
      if( input )input.value = this.textContent;
    });
    ['keyup','mouseup','cut'].forEach( function( event ) { 
      content.addEventListener( event, function(e){
        if( this.innerHTML.length == 0 ) this.parentNode.parentNode.removeChild(this.parentNode); 
      });
    });
  };

  var addCloseListeners = function ( taggableInput, tagBody ) {
    var closeNode = document.createElement( 'div' );
    closeNode.className = 'ti-tag-close';
    closeNode.appendChild( taggableInput.closeElement.cloneNode(true) );
    closeNode.addEventListener('click', function (e) {
      taggableInput.remove( tagBody.parentNode ); 
    });
    tagBody.appendChild( closeNode );
  };

  var TaggableInput = function( container, opts ) {
    var opts = opts     || {};
    opts.tag = opts.tag || {};

    var values        = parseValues( opts.values );
    this.tagClass     = opts.tag.klass || opts.tagKlass ||  defaults.tagClass;
    this.closeElement = createElementFromString( opts.tag.close || opts.tagClose ||  defaults.close );
    this.hiddenSpan   = createHiddenSpan();
    this.delimiter    = parseDelimiters(  opts.delimiter );
    this.editable     = defaults.booleans.true.includes( opts.editable );
    this.draggable    = !defaults.booleans.false.includes( opts.draggable );
    this.close        = !defaults.booleans.false.includes( opts.close );
    this.backspace    = !defaults.booleans.false.includes( opts.backspace );
    this.input        = createInput( this, container,  this.hiddenSpan );
    this.container    = createContainer( container, this.input );
    this.id           = this.container.id;

    if  ( this.draggable  ) attachDragListeners( this );
    if  ( this.input.name ) this.name = this.input.name; 
    
    for ( var i in defaults.events ) this[ i ] = opts[ i ] || defaults.events[ i ];

    build ( this.container, this.input, this.hiddenSpan );
    TaggableInput.elements [ this.id ] = this;
    this.add ( values );
  };

  TaggableInput.prototype = {
    add : function( tags ) {
      tags = [].concat.apply( [], Array.apply( null, arguments ) );
      var taggableInput = this;
      return tags.reduce( function ( elements, tag ) {
        var element  = taggableInput._createTag( tag );
        if ( element ) elements.push( element );
        return elements;
      }, [] );
    },
    remove : function( matcher ) {
      var tags = [].concat( this.tags( matcher ) );
      for ( var i = 0; i < tags.length; i++ ) if ( tags[i] ) tags[i].parentNode.removeChild( tags[i] );
      this._reset();
      return tags;
    },
    pop : function() { 
      var tag = this.remove( -1 ); 
      return tag; 
    },
    tags: function( matcher ) {
      var tags;
      if ( matcher instanceof HTMLElement ) tags = [].concat( matcher )
      else {
        tags = this.container.getElementsByClassName( defaults.tagContainerClass );
        if      ( typeof matcher === 'number' ) tags    = [ tags[ ( tags.length + matcher ) % tags.length ] ];
        else if ( typeof matcher === 'string' ) matcher = new Regexp('^'+matcher+'$'); 
        if      ( matcher instanceof RegExp   ) tags    = [].reduce.apply( tags, [ function( org, item ) { 
          if ( matcher.test( item.getElementsByClassName('ti-tag-content')[0].textContent ) ) return org.concat( item ); 
          return org;
        }, [] ] );
      }
      return Array.apply( null, tags );
    },
    values: function( matcher ) {
      var tags = this.tags( matcher );
      return [].map.call( tags, function( item ) { return item.getElementsByClassName('ti-tag-content')[0].textContent; } );
    },
    _reset: function() {
      if ( !this.name ) return;
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
    },
    _addTags: function () {
      var items = this.input.value.split( this.delimiter.separator );
      if ( items[ items.length - 1 ].length === 0 ) items.pop();
      this.add( items );
      this.input.value = '';
    },
    _createTag: function( item ) {
      if ( !item || !item.length ) return;
      var index    = this.tags().length;
      item = this.beforeInsert( item, index );
      if ( !item ) return;
      
      var tag     = createTagElement( item ); 
      var content = tag.getElementsByClassName('ti-tag-content')[0];
      content.parentNode.className += ' ' + this.tagClass;
      
      if ( this.editable  ) addEditableListeners ( content ); 
      if ( this.close     ) addCloseListeners    ( this, content.parentNode );
      if ( this.draggable ) tag.setAttribute('draggable', 'true'); 
      if ( this.name      ) {
        var hiddenInput = createHiddenInput( this.name, index, tag );
        this.container.appendChild( hiddenInput );
      }
      this.container.insertBefore( tag , this.input );
      this.afterInsert( tag, item, index );
    }, 
    _calibrateInput: function() {
      this.hiddenSpan.textContent = this.input.value;
      this.input.style.width = this.hiddenSpan.clientWidth + ( this.input.offsetWidth - this.input.clientWidth + 5 ) + 'px';
    }
  };

  TaggableInput.elements = {};
  
  window.onload = function(){
    embedTaggableInput(); 
  };

  return TaggableInput;

})();
