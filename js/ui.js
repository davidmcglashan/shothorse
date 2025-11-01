const ui = {
	version: '0.0.2',

	/**
	 * Toggles dark mode
	 */
	dark: () => {
		let html = document.getElementById('html')
		html.classList.toggle('dark')

		if ( html.classList.contains('dark') ) {
			localStorage['shothorse.dark'] = true
		} else {
			localStorage.removeItem( 'shothorse.dark' )
		}
	},

	/**
	 * Initialise the UI. To be called once at point of page load.
	 */
	init: () => {
		ui.restoreState()

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
	},

	/**
	 * Restores the UI to its previous state invoking localstorage. Called once on page load.
	 */
	restoreState: () => {
		// Are we doing dark mode?
		if ( localStorage[ 'shothorse.dark' ] ) {
			let html = document.getElementById('html')
			html.classList.add('dark')
		}

		// Add an escape listener for the slide-in tray.
		document.addEventListener( 'keydown', (event) => {
			if ( tray.classList.contains( 'closed' ) ) {
				return
			}
			if ( event.key === 'Escape' ) {
				ui.help()
			}
		})
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