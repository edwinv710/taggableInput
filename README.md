## TaggableInput

TaggableInput allows for the seamless creation of tags directly from an input field. 

[ View examples on CodePen ](https://codepen.io/recursiveEd/pen/KNbLKN)

#### Getting Started


A TaggableInput is created either by adding the class 'taggable-input' to an HTML DOM element and passing the parameters through data attributes or by using the javascript API. 

``` html
  <div class='taggable-input' data-delimiter data-editable data-draggable data-removable data-close >
```

``` javascript
  new TaggableInput ( container, { delimiter, editable, draggable, removable } );
```

* **container**    ( required ) - An **HTMLElement** or a **string** containing the Id of the DOM element where the input will append.
* **delimiter**    ( optional ) - A string, numerical keycode, or an array of string or keycodes that, upon typing, triggers the creating of a tag. The default value is **' '**.
* **editable**     ( optional ) - If set to true, a tag can be edited in place. The default value is **false**.
* **draggable**    ( optional ) - If true tags can be dragged and rearranged by users. The default value is **true**.
* **close**        ( optional ) - If set to true, tags are removable upon clicking an x marker. The default value is **true**.
* **closeElement** ( optional ) -  An **HTMLElement** or a **string** representation of an element to replace the starndard close element. Can be used to change the close element ot an icon.
* **tagClass**     ( optional ) -  A **string** containing a class name to replace the default class for each tag.

``` javascript
  var tinput = new TaggableInput( 'tinput', {
    draggable: false,
    delimiter: [ ',', ' ' ]
  });
``` 

### Methods

* **add** ( tags ) -  Adds non-empty tags.
  * tags ( required ) - **Strings** containing the text inside the tag.
    * Example: 
``` javascript 
  taggableInput.add( 'Is', 'it', 'me', 'you', 'are', 'looking', 'for', '?'  );
```

* **remove** ( matcher ) -  Removes tags from an input and returns the DOM elements.
  * matcher ( required ) - The zero based index, regex, string representation of a tag. 
  * Example: 
``` javascript 
  taggableInput.remove( 2 );
  taggableInput.remove( 'code' );
  taggableInput.remove( /javascript|ruby/ );
```

* **pop** -  Removes the last tag and returns the DOM element removed. 
  * Example: 
```javascript 
  taggableInput.pop();
```

* **tags** ( matcher ) - Returns an array of HTMLElements, specified by the matcher . If the matcher is omitted, returns all tags in the given input.
  * matcher ( optional ) - The zero-based index, regex, string representation of a tag. 
    * Example: 
``` javascript
  taggableInput.tags();
  taggableInput.tags( /code/ );
```

* **values** ( matcher ) - Returns an array of strings specified by the matcher. If the matcher is omitted, returns all tags in the given input.
  * matcher ( optional ) - The zero-based index, regex, or string representation of a tag. 
    * Example: 
``` javascript
  taggableInput.values();
  taggableInput.values( 3 );
```
### Events

Events allow for the modification and manipulation of tags before and after insertion. They can be used to validate label and changing labels appearance by manipulating the DOM element. 

* **beforeInsert** ( text ) -  Executes before a tag is inserted. To prevent the insertion of a tag, set the function to returns false. To change the tag's text, return a string with the desired text;
  * text ( String ) - The text inside the tag.
    * Example: 
``` javascript 
  taggableInput.beforeInput = function( text ) {
    text = text.trim();
    if( text.length ) return text;
    return false;
  };
 ```

* **afterInsert** ( tag, text, index) - Executes after a tag is inserted.
  * tag ( HTMLElement ) - The newly added DOM element.
  * text ( String ) - A string representation of the tag.
  * index ( Number ) - The zero-based index.
  * Example: 
``` javascript 
  taggableInput.afterInput = function( tag, text, index ) {
    if ( parseInt( text ) ) return;
    tag.className += ' number-warning';
  };
 ```

### Using TaggableInput with forms

TaggableInput can be used to pass tag values with through forms. The library will detect the input field's name attribute and create a hidden input field for each tag created. Re-arranging tags will change the index of the hidden input fields allowing for the sending of tags in the order they appear.

```html
  <div class='taggable-input' data-delimiter data-editable data-draggable data-removable data-close >
```

```javascript
  new TaggableInput ( container, { delimiter, editable, draggable, removable } );
```

* **container**    ( required ) - An **HTMLElement** or a **string** containing the Id of the DOM element where the input will append.
* **delimiter**    ( optional ) - A string, numerical keycode, or an array of string or keycodes that, upon typing, triggers the creating of a tag. The default value is **' '**.
* **editable**     ( optional ) - If set to true, a tag can be edited in place. The default value is **false**.
* **draggable**    ( optional ) - If true tags can be dragged and rearranged by users. The default value is **true**.
* **close**        ( optional ) - If set to true, tags are removable upon clicking an x marker. The default value is **true**.
* **closeElement** ( optional ) -  An **HTMLElement** or a **string** representation of an element to replace the starndard close element. Can be used to change the close element ot an icon.
* **tagClass**     ( optional ) -  A **string** containing a class name to replace the default class for each tag.

```javascript
  var tinput = new TaggableInput( 'tinput', {
    draggable: false,
    delimiter: [ ',', ' ' ]
  });
``` 

### Methods

* **add** ( tags ) -  Adds non-empty tags.
  * tags ( required ) - **Strings** containing the text inside the tag.

```javascript 
  taggableInput.add( 'Is', 'it', 'me', 'you', 'are', 'looking', 'for', '?'  );
```

* **remove** ( matcher ) -  Removes tags from an input and returns the DOM elements.
  * matcher ( required ) - The zero-based index, regex, string representation of a tag. 

```javascript 
  taggableInput.remove( 2 );
  taggableInput.remove( 'code' );
  taggableInput.remove( /javascript|ruby/ );
```

* **pop** -  Removes the last tag and returns the DOM element removed. 

```javascript 
  taggableInput.pop();
```

* **tags** ( matcher ) - Returns an array of HTMLElements, specified by the matcher . If the matcher is omitted, returns all tags in the given input.
  * matcher ( optional ) - The zero-based index, regex, string representation of a tag. 

```javascript
  taggableInput.tags();
  taggableInput.tags( /code/ );
```

* **values** ( matcher ) - Returns an array of strings specified by the matcher. If the matcher is omitted, returns all tags in the given input.
  * matcher ( optional ) - The zero-based index, regex, or string representation of a tag. 

```javascript
  taggableInput.values();
  taggableInput.values( 3 );
```

### Events

Events allow for the modification and manipulation of tags before and after insertion. They can be used to validate label and changing labels appearance by manipulating the DOM element. 

* **beforeInsert** ( text ) -  Executes before a tag is inserted. To prevent the insertion of a tag, set the function to returns false. To change the tag's text, return a string with the desired text;
  * text ( String ) - The text inside the tag.

```javascript 
  taggableInput.beforeInput = function( text ) {
    text = text.trim();
    if( text.length ) return text;
    return false;
  };
```

* **afterInsert** ( tag, text, index) - Executes after a tag is inserted.
  * tag ( HTMLElement ) - The newly added DOM element.
  * text ( String ) - A string representation of the tag.
  * index ( Number ) - The zero-based index.

```javascript 
  taggableInput.afterInput = function( tag, text, index ) {
    if ( parseInt( text ) ) return;
    tag.className += ' number-warning';
  };
```

### Using TaggableInput with forms

TaggableInput can be used to pass tag values with through forms. The library will detect the input field's name attribute and create a hidden input field for each tag created. Re-arranging tags will change the index of the hidden input fields allowing for the sending of tags in the order they appear.

```html
  <input type="text" name="foo" class="taggable-input" values="foo1,foo2,foo3" /> 
```

```javascript
  var textbox = document.querySelector('input[name=foo]');
  var taggableInput = TaggableInput( textbox, { values: [ 'foo1', 'foo2', 'foo3' ] } );
```

### Styling

TaggableInput is fully customizable. You can set a custom class to add to each tag opening up the possibility to use external CSS to style tags. 

```html
  <div class='taggable-input' data-tag-class='label'  >
```
You can also replace the default close button by passing the **closeElement** option to the API.

```javascript
  var taggableInput = TaggableInput( 'awesome-tag', { closeElement: "<i class='fa fa-close'></i>" } );
```
The orientation of TaggableInput can be changed by adding the **ti-vertical** class the target HTML element.

```html
  <div class='taggable-input ti-vertical' >
```

### Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/edwinv710/Tag2Input. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

### License

The library is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
