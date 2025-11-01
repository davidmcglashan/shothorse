const viewport = {
	imgElem: null,
	objects: [],

	/**
	 * Initialise the canvas with the new <img> element being passed in.
	 */
	init: ( elem ) => {
		let div = document.getElementById( 'cta' )
		cta.classList.add( 'hidden' )

		div = div.parentElement
		div.appendChild( elem )

		// Trash the previous node if we had one
		if ( viewport.imgElem ) {
			viewport.imgElem.remove()
		}
		viewport.imgElem = elem
		
		// trash all the previous painting shapes too!
		viewport.objects = [ viewport.newObject( elem, 'Pasted image' ) ]
		viewport.updateObjectList()
	},

	newObject: ( elem, name ) => {
		obj = {}
		obj.elem = elem
		obj.name = name
		obj.id = crypto.randomUUID()
		elem.setAttribute( 'id', obj.id )
		return obj
	},

	updateObjectList: () => {
		let div = document.getElementById( 'list' )
		div.innerHTML = ''

		for ( let obj of viewport.objects ) {
			let elem = document.createElement( 'a' )
			elem.innerHTML = obj.name
			div.appendChild( elem )
		}
	}
}