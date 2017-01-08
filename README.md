## TaggableInput

Taggable Input allows for the seamless creation of tags directly from an input field. To see it in action, visit the demo on [CodePen] (https://codepen.io/recursiveEd/pen/KNbLKN).

### Getting Started

''' javacscript
new TaggableInput ( container, { delimiter, editable, draggable, removable } );
'''

* container ( required ) - An **HTMLElement object** or string containg the id of the dom element where the input will be appended.
* delimiter ( optional ) - Character or characters that triggers the creation of a tag upon typing. The default value is ' '.
* editable ( optional ) - Indicates whether tags created can be changed by the user. The default value is true.
* Indicates whether tags whether tags can be dragged and rearanged by a users. The default value is true.
* Indicates whether tags display the option to remove them individually. The default value is true.

To create an object use the following constructor.

### Options

* delimeter: [string]  [ array of string ]
  * Default - ' ' 
  * Example: delimeter: ','

* editable: [ boolean ]
  * Default - true
  * Example: editable: false

* draggable:   [ boolean ]
  * Default: true
  * Example: draggable: false

* removable: [ boolean ]      
  * Required -  true
  * Example: delimeter: ','

### Methods

* add:
  * Parameters: [string]  [ array of string ]
  * Description: Adds tags to the input.
  * Example: taggableInput.add( ['can', 'you', 'see', 'me', 'now' ] )

* remove:
  * Parameters: [string]  [ array of string ]
  * Description: Removes tags from input
  * Example: taggableInput.remove( ['can', 'you', 'see', 'me', 'now' ] )

* pop:
  * Parameters: none
  * Description: Removes the last tag from an input.
  * Example: taggableInput.pop();

* tags:
  * Parameters: none
  * Description: Return all tags. 
  * Example: taggableInput.tags();

### Events

* beforeInsert:
  * Parameters: (  )
  * Description: Executes before a tag is added to an input. If the function returns false, the tag will not be added. 
  * Example: taggableInput.beforeInput = function(  ) {
               if( tag.trim().length === 0 ) return false
             }
* afterInsert:
  * Parameters: none
  * Description: Executes after a tag is added to an input.
  * Example: taggableInput.tags();

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/edwinv710/Tag2Input. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

### License

The library is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT). callback for invalid inputs
- add css to distinguish between valid and invalid inputs.

