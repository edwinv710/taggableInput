var Tag2Input = ( function() {

  var containerClass = 'tag2-input';
  var labelClass    =  'label';
  var defaultDelimiters = [ ' ' ];

  var inputChange = function ( tag2Input, hiddenSpan ) {
    var delimiter = tag2Input.delimiter.join('|'); 
    console.log(delimiter);
    var delimiterRegex = new RegExp( delimiter );
    return function( e ){
      if ( delimiterRegex.test( this.value ) ) {
        var items = this.value.split( delimiterRegex );
        if ( delimiterRegex.test( this.value[ this.value.length - 1 ] ) ) items.pop();
        tag2Input.add( items );
        this.value = '';
        hiddenSpan.innerHTML = '';   
      } else hiddenSpan.innerHTML = this.value;
      this.style.width = hiddenSpan.clientWidth + ( this.offsetWidth - this.clientWidth + 5 ) + 'px';
    };
  }
  
  var createContainer = function( container ) {
    if ( typeof container === 'string' ) container = document.getElementById( container );
    if ( ! (container instanceof HTMLElement ) ) throw 'Please provide a valid container.';
    container.className = ' '+containerClass;
    container.onclick = function( e ) {
      if ( e.target !== this ) return;
      this.getElementsByTagName('input')[0].focus();
    }
    return container;
  };

  var createHiddenSpan = function() {
    var span = document.createElement('span');
    span.className = 'hiddenSpan';
    span.style.position = 'absolute';
    span.style.display = 'inline-block';
    span.style.height = '0px';
    span.style.left = '0';
    span.style.top = '0';
    span.style.overflow = 'hidden';
    return span;
  }

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
    var style = input.currentStyle || window.getComputedStyle(input);
    console.log(style.border)
  };

  var dropCallback = function ( isLeft ) {
    return function(e) {
      var item   = document.getElementById(e.dataTransfer.getData('item'));
      var target = e.target;
      var parent = target.parentNode;
      if (isLeft) parent.parentNode.insertBefore( item, parent );
      else        parent.parentNode.insertBefore( item, parent.nextSibling );
      e.stopPropagation();
      return false;
    }
  }

  var createLabel = function( item, editable, draggable ) {
    var outer   = document.createElement('div' );
    var left    = document.createElement('span');
    var content = document.createElement('span');
    var right   = document.createElement('span');
    
    outer.className = 'label label-primary'
    outer.id          = 'label-' + Math.random().toString(36).substr(2, 18).toUpperCase();
    
    content.innerText = item;
    content.className = 'content';
    
    if ( editable ) {
      content.setAttribute('contenteditable', true);
      content.addEventListener('keydown', function(e){
        if ( e.which === 8 && this.innerHTML.length === 1 ) this.parentNode.parentNode.removeChild(this.parentNode);
      });
    }
  
    left.className  = 'drop-left';
    left.innerHTML  = '&nbsp;'
    right.innerHTML = '&nbsp;'
    right.className = 'drop-right';

    
    outer.appendChild( left    );
    outer.appendChild( content );
    outer.appendChild( right   );

    if ( draggable ) {
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
  }  

  var Tag2Input = function( container, opts ) {
    var hiddenSpan = createHiddenSpan();
    this.delimiter = opts.delimiter  || defaultDelimiters;
    this.delimiter = this.delimiter instanceof Array ?  this.delimiter : [ this.delimiter ];
    this.delimiter = this.delimiter.map(function(item){ return item.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); });
    this.editable  = opts.editable != false;
    this.draggable = opts.draggable != false;

    this.container = createContainer( container );
    this.input     = createInput( this, hiddenSpan );
    build( this.container, this.input, hiddenSpan );
  }

  Tag2Input.prototype = {
    add : function( labels ) {
      if ( ! ( labels instanceof Array ) ) labels = [ label ];
      for ( var i = 0; i < labels.length; i++ ) {
        labels[i] = createLabel( labels[i].trim(), this.editable, this.draggable );
        this.container.insertBefore( labels[i] , this.input);
      }
    },
    remove : function( label ) {
      if ( typeof label === 'number' ) label = this.tags( label );
      label.parentNode.removeChild( label );
    },
    pop : function() {
      var tag = this.tags(-1);
      tag.parentNode.removeChild( tag );
    },
    tags: function(index) {
      var tags = this.container.getElementsByClassName( labelClass );
      if ( !index ) return tags;
      index = ( tags.length + index ) % tags.length;
      return tags[index];
    }
  };

  return Tag2Input;
} )();