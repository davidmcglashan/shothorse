const ui = {
	version: 'v0.1.4',

	/**
	 * Initialise the UI. To be called once at point of page load.
	 */
	init: () => {
		// Put the version string into any elements with a version class.
		let versions = document.getElementsByClassName( 'version' )
		for ( let version of versions ) {
			version.innerHTML = ui.version
		}

		// Put the current year into any elements with a year class (copyright notices and stuff)
		let years = document.getElementsByClassName( 'year' )
		for ( let year of years ) {
			year.innerHTML = new Date().getFullYear()
		}

		// Populate the colours dropdown
		let select = document.getElementById( 'colour' )
		for ( let colour of viewport.colours ) {
			let option = document.createElement( 'option')
			select.appendChild( option )

			option.setAttribute( 'value', colour.name )
			option.innerHTML = colour.name
		}

		ui.restoreState()
	},

	/**
	 * Restores the UI to its previous state invoking localstorage. Called once on page load.
	 */
	restoreState: () => {
		if ( localStorage[ 'shothorse.colour' ] ) {
			document.getElementById( 'colour' ).value = localStorage[ 'shothorse.colour' ]
		}

		// Add an escape listener for the slide-in tray.
		document.addEventListener( 'keydown', (event) => {
			if ( tray.classList.contains( 'closed' ) ) {
				return
			}
			if ( event.key === 'Escape' ) {
				ui.help()
			}
		} )

		// This is the paste event listener. We do the IO here and initialise the canvas JS object
		// with any images we find in the clipboard.
		document.addEventListener( 'paste', async (ev) => {
			for ( const file of ev.clipboardData.files ) {
				const img = document.createElement( 'img' );
				img.src = URL.createObjectURL( file );
				img.decode().then(() => {
					viewport.init( img );
				})
			}
		} );

		// Have the viewport listen to mouse events occurring on the glass pane.
		let glass = document.getElementById( 'glass' )
		glass.addEventListener( 'mouseup', viewport.mouseReleased )
		glass.addEventListener( 'mousemove', viewport.mouseMoved )
		glass.addEventListener( 'mousedown', viewport.mousePressed )

		// Have the viewport listen to keypresses too ...
		document.addEventListener( 'keydown', viewport.keyDown )
		document.addEventListener( 'keyup', viewport.keyUp )
		addEventListener( 'resize', (event) => { viewport.snap() } )

	},

	setColour: () => {
		localStorage[ 'shothorse.colour' ] = document.getElementById( 'colour' ).value
		viewport.setColour()
	},

	/**
	 * Toggles the slide-in tray so the user can access the about page.
	 */
	about: () => {
		document.getElementById('lightbox').classList.toggle('show')
		
		// The tray starts with neither an open or closed class since this triggers an animation. First time
		// through simply set an open class on it. Subsequent goes can then toggle open and closed classes.
		let tray = document.getElementById('tray')
		if ( tray.classList.length === 0 ) {
			tray.classList.add('open')
		} else {
			tray.classList.toggle('closed')
			tray.classList.toggle('open')
		}

		// Finally, find every element was a tabIndex. These are either 'on' (0) or off ('-1') and we want to
		// toggle their states.
		let elems = document.querySelectorAll("[tabindex]");
		for ( let i = 0; i < elems.length; i++ ) {
			elems[i].tabIndex = -1 - elems[i].tabIndex;
		}
	},

}