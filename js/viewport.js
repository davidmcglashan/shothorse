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
	},

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
		viewport.objects = [ viewport.newObject( elem, 'Pasted image' ) ]
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
		obj.name = '' + type
		obj.id = crypto.randomUUID()
		return obj
	},

	/**
	 * A mouse press happened on the glass, usually the prelude to a drag/drop operation. 
	 */
	mousePressed: ( event ) => {
		if ( viewport.mightDraw ) {
			let obj = viewport.newObject( viewport.mightDraw )
			viewport.objects.push( obj )
			viewport.drawingObj = obj
			
			obj.x = event.clientX
			obj.y = event.clientY - 44
		}
	},

	/**
	 * Commits whatever drag we were doing.
	 */
	mouseReleased: ( event ) => {
		viewport.drawingObj = null
		viewport.updateObjectList()
	},

	/**
	 * If we're mid-drag then update the appropriate models and ask for a repaint ...
	 */
	mouseMoved: ( event ) => {
		if ( viewport.drawingObj ) {
			obj.x2 = event.clientX
			obj.y2 = event.clientY - 44
			viewport.paint()
		}
	},

	/**
	 * Sets the drawing mode while a key is held, e.g. holding B will draw a box with a mouse drag.
	 */
	keyDown: ( event ) => {
		// 65 is 'A' for arrow.
		if ( event.keyCode === 65 ) {
			viewport.mightDraw = viewport.types.arrow
		}

		// 66 is 'B' for box.
		else if ( event.keyCode === 66 ) {
			viewport.mightDraw = viewport.types.box
		}
	},

	/**
	 * Resets the drawing mode.
	 */
	keyUp: ( event ) => {
		viewport.mightDraw = null
	},

	/**
	 * Redraws the list of objects on the side of the UI.
	 */
	updateObjectList: () => {
		let div = document.getElementById( 'list' )
		div.innerHTML = ''

		for ( let obj of viewport.objects ) {
			let elem = document.createElement( 'a' )
			elem.innerHTML = obj.name
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
		let cc = viewport.canvas.getContext("2d");
		cc.clearRect( 0,0, viewport.canvas.width, viewport.canvas.height )

		for ( let obj of viewport.objects ) {
			viewport.paintObj( cc, obj )
		}
	},

	paintObj: ( cc, obj ) => {
		if ( obj ) {
			switch ( obj.type ) {
				case viewport.types.box:
					cc.beginPath()
					cc.rect( obj.x, obj.y, obj.x2-obj.x, obj.y2-obj.y)
					cc.stroke()
					break

				case viewport.types.arrow:
					cc.beginPath()
					cc.moveTo( obj.x, obj.y )
					cc.lineTo( obj.x2, obj.y2 )
					cc.stroke()
					break
			}
		}
	}
}