## TaggableInput

Taggable Input allows for the seamless creation of tags directly from an input field. To see it in action, visit the demo on [CodePen] (https://codepen.io/recursiveEd/pen/KNbLKN).

### Getting Started

''' javacscript
new TaggableInput ( container, { delimiter, editable, draggable, removable } );
'''

* container ( required ) - An **HTMLElement object** or string containg the id of the dom element where the input will be appended.
* delimiter ( optional ) - Character or characters that triggers the creation of a tag upon typing. The default value is ' '.
* editable ( optional ) - Indicates whether tags created can be changed by the user. The default value is true.
* draggable ( optional ) - Indicates whether tags whether tags can be dragged and rearanged by a users. The default value is true.
* removable ( optional ) - Indicates whether tags display the option to remove them individually. The default value is true.

### Methods

* add ( labels ) -  Adds tags to the input.
  * labels: A string or an array of string containing the text of the labels to be added.
  * Example: taggableInput.add( ['can', 'you', 'see', 'me', 'now' ] )

* remove ( labels ) -  Removes tags from input
  * labels: A string or an array of string containing the text of the labels to be removed.
  * Example: taggableInput.remove( ['can', 'you', 'see', 'me', 'now' ] )

* pop -  Removes the last tag from an input.
  * Example: taggableInput.pop();

* tags - Return all tags. 
  * Example: taggableInput.tags();

### Events

* beforeInsert ( text, index ) -  Executes before a tag is added to an input. If the function returns false, the tag will not be added. The function recieves the text, as a string, to be added to the input and the index, as a number, that the label will occupy. 
  * Example: taggableInput.beforeInput = function(  ) {
               if( tag.trim().length === 0 ) return false
             }
             
* afterInsert ( label, index, text ) - Executes after a taf is added to the input. The function recieves the newly label, as a dom element, the text pertaining to the label, as a string, and the index of the label, as a number.
  * Example: taggableInput.tags();

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/edwinv710/Tag2Input. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

### License

The library is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT). callback for invalid inputs
- add css to distinguish between valid and invalid inputs.

