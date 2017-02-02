## TaggableInput

TaggableInput allows for the seamless creation of tags directly from an input field. To see it in action, visit the demo on [CodePen] (https://codepen.io/recursiveEd/pen/KNbLKN).

### Getting Started

TaggableInputs can be created by ejther adding options as data attributes directly on an HTML element of the class `taggable-unput` or through the javascript api. 

``` html
  <div class='taggable-input' data-delimiter data-editable data-draggable data-removable data-close >
```

``` javascript
  new TaggableInput ( container, { delimiter, editable, draggable, removable , close, close} );
```
* **container** ( required ) - An **HTMLElement** or a **string** containing the Id of the DOM element where the input will append.
* **delimiter** ( optional ) - A string or an array of string that, upon typing, triggers the creating of a tag. The default value is **' '**.
* **editable**  ( optional ) - If set to true, a tag can be edited in place. The default value is **true**.
* **draggable** ( optional ) - If true tags can be dragged and rearranged by users. The default value is **true**.
* **removable** ( optional ) - If set to true, tags are removable upon clicking an x marker. The default value is **true**.

``` javascript
  var tinput = new TaggableInput( 'tinput', {
    removable: false,
    draggable: false
  });
```

``` html
  <div class='taggable-input' data-removable=false data-draggable=false ></div>
``` 

### Methods

* **add** ( labels ) -  Adds tags to an input.
  * labels ( required ) - A **string** or an **array** of string containing the text inside the label.
    * Example: 
``` javascript 
  taggableInput.add( ['can', 'you', 'see', 'me', 'now' ] );
```

* **remove** ( index ) -  Removes tags from an input
  * index ( required ) - The zero based index, as a **Number**. 
  * Example: 
``` javascript 
  taggableInput.remove( ['can', 'you', 'see', 'me', 'now' ] );
```

* **pop** -  Removes the last tag from an input.
  * Example: 
```javascript 
  taggableInput.pop();
```

* **indexOf** ( label ) - Returns the index of the first occurrence of the label passed a parameter.
  * label ( required ) - Either a **string** or an **HTMLElement**. If a string, returns the index of the first label containing the text. 
  * Example: 
``` javascript
  var index = taggableInput.indexOf( 'Snow' );
```

* **tags** ( index ) - Returns the tag specified by the index as an HTMLElement. If an index is omitted, returns all labels as an array of HTMLElements.
  * index ( optional ) - The zero based index, as a **Number**. 
    * Example: 
``` javascript
  taggableInput.tags();
```

* **values** ( index ) - Returns the tag specified by the index as a **string**. If an index is omitted, returns all labels as an **array** of strings.
  * index ( optional ) - The zero based index, as a **Number**. 
    * Example: 
``` javascript
  taggableInput.tags();
```
### Events

* **beforeInsert** ( text, index ) -  Executes before a tag is inserted. To prevent the insertion of a tag, set the function to returns false. To change the tag's text, return a string with the desired text.
  * text ( String ) - The text inside the tag.
    * index ( Number ) - The zero-based index.
    * Example: 
``` javascript 
  taggableInput.beforeInput = function( text, index ) {
    text = text.trim();
    if( text.length ) return text;
    return false;
  };
 ```

* **afterInsert** ( label, text, index) - Executes after a tag is inserted.
  * label ( HTMLElement ) - The newly added dom element.
  * text ( String ) - A string representation of the tag.
  * index ( Number ) - The zero-based index.
  * Example: 
``` javascript 
  taggableInput.afterInput = function( label, text, index ) {
    if ( parseInt( text ) ) return;
    label.className += ' number-warning';
  };
 ```

### Using TaggableInputs with forms

To use TaggableInput with forms, add an input with the class `taggable-input` and a name attribute. Options can also be added as data attributes. Labels created will also create hidden input fields using the name given to the textbox. Re-arranging tags will change the index of the hidden input fields allowing for the sending of tags in the order they appear.

```html
  <input type=text name=foo class=taggable-input values='foo1,foo2,foo3' /> 
```
Inputs can also be passed to the javascript api to create the same effect.

```javascript
  var textbox = document.querySelector('input[name=foo]');
  var taggableInput = TaggableInput( textbox, { values: [ 'foo1', 'foo2', 'foo3' ] } );
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/edwinv710/Tag2Input. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

### License

The library is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
