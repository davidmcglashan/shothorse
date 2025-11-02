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
		{ name: 'Red', rgb: '#cc0000' },
		{ name: 'Orange', rgb: '#ff8800' },
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
	 * The image has been deleted so stop everything!
	 */
	stop: () => {
		// Firstly tide up the models ...
		viewport.objects = []

		// Now the UI.
		let cta = document.getElementById( 'cta' )
		cta.classList.remove( 'hidden' )
		viewport.imgElem.remove()
		viewport.imgElem = null
		viewport.updateObjectList()

		// Can't call paint, but we can wipe the canvas.
		let cc = viewport.canvas.getContext("2d");
		cc.clearRect( 0,0, viewport.canvas.width, viewport.canvas.height )
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
		// Mouse interactions can be disregarded without prior incanti ...
		if ( !viewport.nextDrawFunc || !viewport.imgElem ) {
			return
		}
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
				viewport.drawingObj.y = event.clientY - bound.y
				viewport.drawingObj.x2 = event.clientX - bound.x
				viewport.drawingObj.y2 = event.clientY - bound.y
				viewport.drawingObj.offsetx = 0
				viewport.drawingObj.offsety = 0
				break
			
			// If we're moving something just get the current selection.
			case viewport.types.move_start:
				viewport.drawingObj = viewport.selection
				viewport.drawingObj.offsetx = event.clientX - viewport.drawingObj.x - bound.x
				viewport.drawingObj.offsety = event.clientY - viewport.drawingObj.y - bound.y
				viewport.paint()
				break

			case viewport.types.move_end:
				viewport.drawingObj = viewport.selection
				viewport.drawingObj.offsetx = event.clientX - viewport.drawingObj.x2 - bound.x
				viewport.drawingObj.offsety = event.clientY - viewport.drawingObj.y2 - bound.y
				viewport.paint()
				break
		}
	},

	/**
	 * Commits whatever drag we were doing.
	 */
	mouseReleased: ( event ) => {
		viewport.drawFunc = null
		viewport.drawingObj = null
		viewport.updateObjectList()
		viewport.paint()
	},

	/**
	 * If we're mid-drag then update the appropriate models and ask for a repaint ...
	 */
	mouseMoved: ( event ) => {
		if ( !viewport.drawFunc || !viewport.imgElem ) {
			return
		}

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
			viewport.drawingObj.y2 = event.clientY - bound.y
		}
		viewport.paint()
	},

	/**
	 * Sets the drawing mode while a key is held, e.g. holding B will draw a box with a mouse drag.
	 */
	keyDown: ( event ) => {
		// 65 is 'A' for arrow.
		if ( event.keyCode === 65 ) {
			viewport.nextDrawFunc = viewport.types.arrow
			viewport.glass.setAttribute( 'class', 'draw' )
		}

		// 66 is 'B' for box (or 'R' for rectangle: 82)
		else if ( event.keyCode === 66 || event.keyCode === 82 ) {
			viewport.nextDrawFunc = viewport.types.box
			viewport.glass.setAttribute( 'class', 'draw' )
		}

		// 16 is SHIFT for moving
		else if ( viewport.selection && event.keyCode === 16 ) {
			viewport.nextDrawFunc = viewport.types.move_start
			viewport.glass.setAttribute( 'class', 'move' )
			viewport.paint()
		}

		// 18 is ALT for moving the end
		else if ( viewport.selection && event.keyCode === 18 ) {
			viewport.nextDrawFunc = viewport.types.move_end
			viewport.glass.setAttribute( 'class', 'edit' )
			viewport.paint()
		}

		// Backspace to delete the selected object.
		else if ( viewport.selection && event.keyCode === 8 ) {
			let index = 0
			for ( let obj of viewport.objects ) {
				if ( obj.id === viewport.selection.id ) {
					if ( index === 0 ) {
						viewport.stop()
					} else {
						viewport.objects.splice( index, 1 )
						break
					}
				} else {
					index += 1
				}
			}
			viewport.paint()
			viewport.updateObjectList()
		}

		// Do some arrow key magic ...
		else if ( viewport.selection && event.keyCode === 38 ) {
			viewport.selection.y -= event.altKey ? 0 : (event.shiftKey ? 10 : 1)
			viewport.selection.y2 -= event.shiftKey ? 10 : 1
			viewport.paint()
		} else if ( viewport.selection && event.keyCode === 40 ) {
			viewport.selection.y += event.altKey ? 0 : (event.shiftKey ? 10 : 1)
			viewport.selection.y2 += event.shiftKey ? 10 : 1
			viewport.paint()
		} else if ( viewport.selection && event.keyCode === 37 ) {
			viewport.selection.x -= event.altKey ? 0 : (event.shiftKey ? 10 : 1)
			viewport.selection.x2 -= event.shiftKey ? 10 : 1
			viewport.paint()
		} else if ( viewport.selection && event.keyCode === 39 ) {
			viewport.selection.x += event.altKey ? 0 : (event.shiftKey ? 10 : 1)
			viewport.selection.x2 += event.shiftKey ? 10 : 1
			viewport.paint()
		}
	},

	/**
	 * Resets the drawing mode.
	 */
	keyUp: ( event ) => {
		viewport.nextDrawFunc = null
		viewport.glass.removeAttribute( 'class' )
		viewport.paint()
	},

	/**
	 * Called from the UI. Selects the shape with the matching ID.
	 */
	select: ( id ) => {
		for ( let obj of viewport.objects ) {
			if ( obj.id === id ) {
				viewport.selection = obj
				if ( obj.type === viewport.types.image ) {
					viewport.toggleScale()
				}
				break
			}
		}
	},

	/**
	 * Toggles the scale of the viewport between 100% and 50%. Useful for when retina-resolution
	 * images get pasted in and they're huuge.
	 */
	toggleScale: () => {
		viewport.elem.classList.toggle( 'scaled' )

		// Now scale all the cartesian co-ords in the objects to match the new scale.
		let factor = viewport.elem.classList.contains( 'scaled' ) ? 0.5 : 2
		for ( let obj of viewport.objects ) {
			obj.x *= factor
			obj.x2 *= factor
			obj.y *= factor
			obj.y2 *= factor
		}
		viewport.paint()
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
			elem.setAttribute( 'href', 'javascript:void(0);' )
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
		// Don't do anything unless there's an image.
		if ( !viewport.imgElem ) {
			return
		}

		// Obtain the context for drawing on.
		let cc = viewport.canvas.getContext("2d");
		cc.clearRect( 0,0, viewport.canvas.width, viewport.canvas.height )

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
					viewport.paintBox( cc, obj )
					break

				case viewport.types.arrow:
					viewport.paintArrow( cc, obj )
					break
			}
		}
	},

	/**
	 * Paints the box described by obj into the canvas context cc.
	 */
	paintBox: ( cc, obj ) => {
		// If this is the selected object we want to add affordances for interacting with it.
		if ( viewport.selection && obj.id === viewport.selection.id ) {
			// Moving is indicated with small circles in each corner.
			if ( !viewport.drawFunc && viewport.nextDrawFunc === viewport.types.move_start ) {
				cc.strokeStyle = '#000'
				cc.fillStyle = 'rgba(0,0,0,0.5)'
				cc.lineWidth = 1

				cc.beginPath()
				cc.arc( obj.x, obj.y, 10, 0, 2*Math.PI );
				cc.fill()
				cc.stroke()
				cc.beginPath()
				cc.arc( obj.x, obj.y2, 10, 0, 2*Math.PI );
				cc.fill()
				cc.stroke()
				cc.beginPath()
				cc.arc( obj.x2, obj.y, 10, 0, 2*Math.PI );
				cc.fill()
				cc.stroke()
				cc.beginPath()
				cc.arc( obj.x2, obj.y2, 10, 0, 2*Math.PI );
				cc.fill()
				cc.stroke()
			}

			// Editing is indicated by a small circle around x2,y2
			else if ( !viewport.drawFunc && viewport.nextDrawFunc === viewport.types.move_end ) {
				cc.strokeStyle = '#000'
				cc.fillStyle = 'rgba(0,0,0,0.5)'
				cc.lineWidth = 1

				cc.beginPath()
				cc.arc( obj.x2, obj.y2, 10, 0, 2*Math.PI );
				cc.fill()
				cc.stroke()
			}
		}

		// The box itself is simple.
		cc.beginPath()
		cc.rect( obj.x, obj.y, obj.x2-obj.x, obj.y2-obj.y )
		cc.strokeStyle = obj.rgb
		cc.lineWidth = 2
		cc.stroke()
	},

	/**
	 * Paints the arrow described by obj into the canvas context cc.
	 */
	paintArrow: ( cc, obj ) => {
		// If this is the selected object we want to add affordances for interacting with it.
		if ( viewport.selection && obj.id === viewport.selection.id ) {
			// Moving is indicated with small circles at each end of the line.
			if ( !viewport.drawFunc && viewport.nextDrawFunc === viewport.types.move_start ) {
				cc.strokeStyle = '#000'
				cc.fillStyle = 'rgba(0,0,0,0.5)'
				cc.lineWidth = 1

				cc.beginPath()
				cc.arc( obj.x, obj.y, 10, 0, 2*Math.PI );
				cc.fill()
				cc.stroke()
				cc.beginPath()
				cc.arc( obj.x2, obj.y2, 10, 0, 2*Math.PI );
				cc.fill()
				cc.stroke()
			}

			// Editing is indicated by a small circle around x2,y2
			else if ( !viewport.drawFunc && viewport.nextDrawFunc === viewport.types.move_end ) {
				cc.strokeStyle = '#000'
				cc.fillStyle = 'rgba(0,0,0,0.5)'
				cc.lineWidth = 1

				cc.beginPath()
				cc.arc( obj.x2, obj.y2, 10, 0, 2*Math.PI );
				cc.fill()
				cc.stroke()
			}
		}

		// And now the arrow
		cc.beginPath()
		cc.moveTo( obj.x, obj.y )
		cc.lineTo( obj.x2, obj.y2 )
		cc.strokeStyle = obj.rgb
		cc.lineWidth = 2
		cc.stroke()

		let radians=Math.atan( (obj.y2-obj.y) / (obj.x2-obj.x) );
        radians += ( (obj.x2 > obj.x) ?-90 : 90 ) * Math.PI/180;

		cc.save()
        cc.beginPath();
        cc.translate( obj.x2,obj.y2 );
        cc.rotate( radians );
        cc.moveTo(10,-15);
        cc.lineTo(0,0);
        cc.lineTo(-10,-15);
        cc.restore();
        cc.stroke();
	}
}