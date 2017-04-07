# Paginate component for angularJS

## Feature
The ellipsis can be clicked to quickly cruise the page number.

## Usage
`<div f-paginate page="1" total-page="10" on-pick="callbackFunction($page)"></div>`

`<div f-paginate="{page:1,totalPage:10,onPick:callbackFunction}"></div>`

`<div f-paginate="pageOptionDefinedInScope"></div>`

[Demo](http://htmlpreview.github.io/?https://raw.githubusercontent.com/foyzhao/angular-paginate/master/demo/index.html)

## Options
* **page** (number)

	The current page.
	
* **totalPage** (number)

	The total number of pages.

* **zeroStart** (boolean) (default:true)

	The index of first page is 0 or 1.

* **range** (number) (default:5)

	The number of pages on both sides of the current page. Setting a negative number prevents the drawing of pages.

* **ends** (number) (default:1)

	The number of pages displayed at both ends.

* **ellipsis** (boolean) (default:true)

	Whether to display ellipsis at both sides of the current page. The ellipsis can be clicked to quickly cruise the page number.

* **prevPage** (string|boolean) (default:null)

	Whether to display the previous page button. A string is used to define the button text.

* **nextPage** (string|boolean) (default:null)

	Whether to display the next page button. A string is used to define the button text.

* **firstPage** (string|boolean) (default:null)

	Whether to display the first page button. A string is used to define the button text.

* **lastPage** (string|boolean) (default:null)

	Whether to display the last page button. A string is used to define the button text.

* **adjustLength** (boolean) (default:true)

	Automatically adjust the range option to keep the component length unchanged.

* **currentPageEnable** (boolean) (default:true)

	Whether to enable the current page button.

