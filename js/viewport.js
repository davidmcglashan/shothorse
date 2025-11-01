const viewport = {
	imgElem: null,
	objects: [],
	elem: document.getElementById( 'viewport' ),
	canvas: document.getElementById( 'canvas' ),
	glass: document.getElementById( 'glass' ),

	types: {
		image: 0,
		box: 1,
		arrow: 2,
		move_start: 3,
		move_end: 4
	},

	colours: [
		{ name: 'Red', rgb: '#000000' },
		{ name: 'Orange', rgb: '#aa8800' },
		{ name: 'Green', rgb: '#008800' },
		{ name: 'Blue', rgb: '#0000aa' },
		{ name: 'Black', rgb: '#000000' },
		{ name: 'White', rgb: '#ffffff' },
	],
	
	/**
	 * Initialise the canvas with the new <img> element being passed in.
	 */
	init: ( elem ) => {
		viewport.elem.appendChild( elem )

		let div = document.getElementById( 'cta' )
		cta.classList.add( 'hidden' )

		// Trash the previous node if we had one
		if ( viewport.imgElem ) {
			viewport.imgElem.remove()
		}
		viewport.imgElem = elem
		
		// trash all the previous painting shapes too!
		viewport.objects = [ viewport.newObject( viewport.types.image ) ]
		viewport.updateObjectList()

		// Setup the canvas.
		viewport.snap()
	},

	/**
	 * Creates a new object for adding to the viewport's data model.
	 */
	newObject: ( type ) => {
		obj = {}
		obj.type = type
		obj.id = crypto.randomUUID()
		
		// Work out what colour the shape should be.
		let uicol = document.getElementById( 'colour' ).value
		for ( let colour of viewport.colours ) {
			if ( colour.name === uicol ) {
				obj.rgb = colour.rgb
				break
			}
		}

		return obj
	},

	/**
	 * A mouse press happened on the glass, usually the prelude to a drag/drop operation. 
	 */
	mousePressed: ( event ) => {
		if ( viewport.nextDrawFunc ) {
			viewport.drawFunc = viewport.nextDrawFunc
			
			// Mark the position of the mouse relative to the x,y of the image.
			let bound = viewport.imgElem.getBoundingClientRect()

			switch ( viewport.drawFunc ) {
				// New objects result in a new entry in the datamodel
				case viewport.types.arrow:
				case viewport.types.box:
					viewport.drawingObj = viewport.newObject( viewport.drawFunc )
					viewport.objects.push( viewport.drawingObj )
					viewport.selection = viewport.drawingObj

					// set the bounds of the shape to the current mouse position
					viewport.drawingObj.x = event.clientX - bound.x
					viewport.drawingObj.y = event.clientY - 44 - bound.y
					viewport.drawingObj.x2 = event.clientX - bound.x
					viewport.drawingObj.y2 = event.clientY - 44 - bound.y
					viewport.drawingObj.offsetx = 0
					viewport.drawingObj.offsety = 0
					break
				
				// If we're moving something just get the current selection.
				case viewport.types.move_start:
					viewport.drawingObj = viewport.selection
					viewport.drawingObj.offsetx = event.clientX - viewport.drawingObj.x - bound.x
					viewport.drawingObj.offsety = event.clientY - viewport.drawingObj.y - bound.y
					break

				case viewport.types.move_end:
					viewport.drawingObj = viewport.selection
					viewport.drawingObj.offsetx = event.clientX - viewport.drawingObj.x2 - bound.x
					viewport.drawingObj.offsety = event.clientY - viewport.drawingObj.y2 - bound.y
					break
			}
		}
	},

	/**
	 * Commits whatever drag we were doing.
	 */
	mouseReleased: ( event ) => {
		viewport.drawFunc = null
		viewport.drawingObj = null
		viewport.updateObjectList()
	},

	/**
	 * If we're mid-drag then update the appropriate models and ask for a repaint ...
	 */
	mouseMoved: ( event ) => {
		if ( viewport.drawFunc ) {
			// Mark the position of the mouse relative to the x,y of the image.
			let bound = viewport.imgElem.getBoundingClientRect()

			// Drawing function dictates which co-ords get changed
			if ( viewport.drawFunc === viewport.types.move_start ) {
				let oldx = viewport.drawingObj.x
				let oldy = viewport.drawingObj.y
				viewport.drawingObj.x = event.clientX - bound.x - viewport.drawingObj.offsetx
				viewport.drawingObj.y = event.clientY - bound.y - viewport.drawingObj.offsety
				oldx = viewport.drawingObj.x - oldx
				oldy = viewport.drawingObj.y - oldy
				viewport.drawingObj.x2 += oldx
				viewport.drawingObj.y2 += oldy
			} else if ( viewport.drawFunc === viewport.types.move_end ) {
				viewport.drawingObj.x2 = event.clientX - bound.x - viewport.drawingObj.offsetx
				viewport.drawingObj.y2 = event.clientY - bound.y - viewport.drawingObj.offsety
			} else {
				viewport.drawingObj.x2 = event.clientX - bound.x
				viewport.drawingObj.y2 = event.clientY - 44 - bound.y
			}
			viewport.paint()
		}
	},

	/**
	 * Sets the drawing mode while a key is held, e.g. holding B will draw a box with a mouse drag.
	 */
	keyDown: ( event ) => {
		// 65 is 'A' for arrow.
		if ( event.keyCode === 65 ) {
			viewport.nextDrawFunc = viewport.types.arrow
		}

		// 66 is 'B' for box.
		else if ( event.keyCode === 66 ) {
			viewport.nextDrawFunc = viewport.types.box
		}

		// 16 is SHIFT for moving
		else if ( event.keyCode === 16 ) {
			viewport.nextDrawFunc = viewport.types.move_start
		}

		// 18 is ALT for moving the end
		else if ( event.keyCode === 18 ) {
			viewport.nextDrawFunc = viewport.types.move_end
		}
	},

	/**
	 * Resets the drawing mode.
	 */
	keyUp: ( event ) => {
		viewport.nextDrawFunc = null
	},

	/**
	 * Called from the UI. Selects the shape with the matching ID.
	 */
	select: ( id ) => {
		for ( let obj of viewport.objects ) {
			if ( obj.id === id ) {
				viewport.selection = obj
				break
			}
		}
	},

	/**
	 * Redraws the list of objects on the side of the UI.
	 */
	updateObjectList: () => {
		let div = document.getElementById( 'list' )
		div.innerHTML = ''

		for ( let obj of viewport.objects ) {
			let elem = document.createElement( 'a' )

			switch( obj.type ) {
				case viewport.types.image:
	 		 		elem.innerHTML = 'Pasted image'
					break
				case viewport.types.box:
	 		 		elem.innerHTML = 'Box'
					break
				case viewport.types.arrow:
	 		 		elem.innerHTML = 'Arrow'
					break
			}
			elem.setAttribute( 'href', 'javascript:void' )
			elem.setAttribute( 'onclick', `viewport.select('${obj.id}')` )
			div.appendChild( elem )
		}
	},

	/**
	 * Reconfigures the canvas to sit under the glass element snugly.
	 */
	snap: () => {
		viewport.canvas.width = viewport.glass.getBoundingClientRect().width
  		viewport.canvas.height = viewport.glass.getBoundingClientRect().height
		viewport.paint()
	},

	/**
	 * Paints the objects onto the canvas.
	 */
	paint: () => {
		// Obtain the context for drawing on.
		let cc = viewport.canvas.getContext("2d");
		cc.clearRect( 0,0, viewport.canvas.width, viewport.canvas.height )
		cc.lineWidth = 2

		// Drawing is relative to the x,y of the image. We can simplify this by
		// translating the canvas.
		let bound = viewport.imgElem.getBoundingClientRect()
		cc.translate(bound.x, bound.y )
		for ( let obj of viewport.objects ) {
			viewport.paintObj( cc, obj )
		}

		// Put the translation back.
		cc.translate( -bound.x, -bound.y )
	},

	/**
	 * Paints a single canvas object.
	 */
	paintObj: ( cc, obj ) => {
		if ( obj ) {
			switch ( obj.type ) {
				case viewport.types.box:
					cc.beginPath()
					cc.strokeStyle = obj.rgb
					cc.rect( obj.x, obj.y, obj.x2-obj.x, obj.y2-obj.y )
					cc.stroke()
					break

				case viewport.types.arrow:
					cc.beginPath()
					cc.strokeStyle = obj.rgb
					cc.moveTo( obj.x, obj.y )
					cc.lineTo( obj.x2, obj.y2 )
					cc.stroke()
					break
			}
		}
	}
}