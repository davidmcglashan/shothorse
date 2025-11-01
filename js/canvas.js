const canvas = {
	imgElem: null,

	/**
	 * Initialise the canvas with the new <img> element being passed in.
	 */
	init: ( elem ) => {
		let div = document.getElementById( 'cta' )
		cta.classList.add( 'hidden' )

		div = div.parentElement
		div.appendChild( elem )

		// Trash the previous node if we had one
		if ( canvas.imgElem ) {
			canvas.imgElem.remove()
			// trash all the previous painting shapes too!
		}

		canvas.imgElem = elem
	}
}