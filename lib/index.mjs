import axios from 'axios'
import isFunction from 'validate.io-function'
import isObject from 'validate.io-object'
import isString from 'validate.io-string-primitive'

/**
 * Validates whether the supplied string is a valid ConceptNet URI.
 *
 * @param {string} uri - input string
 * @returns {boolean} true if input is valid URI, false otherwise
 */
function isConceptNetURI( uri ) {
	let  myRegEx = /\/(?:[acdelrs]|and|or)\/[a-zA-Z]{2}\/\w+/;
	return ( myRegEx.test( uri ) ? true : false );
}


/**
 * Validates whether the supplied string is a valid term path.
 *
 * @param {string} path - input string
 * @returns {boolean} true if input is valid term path, false otherwise
 */
function isValidTermPath( path ) {
	let myRegEx = /\/list\/[a-zA-Z]{2}\/\w+(?:@[-+]?[0-9]*\.?[0-9]+)?(,\w+(?:@[-+]?[0-9]*\.?[0-9]+)?)*/;
	return (myRegEx.test(path) ? true : false);
}

function ConceptNet( host = 'https://api.conceptnet.io', port = 80, version ='5.8.1') {
	if ( !(this instanceof ConceptNet) ){
		return new ConceptNet( host, port, version );
	}
	this.host = host;
	this.version = version;
	this.port = port;
}

ConceptNet.prototype.buildOptions = function( path ) {
	let options = {};
	options.hostname = this.host;
	options.port = this.port;
	options.path = path;
	return options;
}

ConceptNet.prototype.lookup = function () {
	let args = arguments;
	let nargs = args.length;
	let uri;
	let params;
	let callback;
	let limit;
	let offset;

	if ( nargs < 2 ) {
		throw new Error( 'insufficient input arguments. Must provide a ConceptNet URI and a callback function.' );
	}

	uri = args[ 0 ];
	if ( !isString( uri ) ) {
		throw new TypeError( 'invalid input argument. First argument must be a string primitive. Value: `' + uri + '`.' );
	}
	if ( nargs < 3 ) {
		limit = 50;
		offset = 0;
		callback = args[ 1 ];
	} else {
		params = args[ 1 ];
		if ( !isObject( params ) ) {
			throw new TypeError( 'invalid input argument. Params argument must be an object. Value: `' + params + '`.' );
		}
		callback = args[ 2 ];
		limit = params.limit || 50;
		offset = params.offset || 0;
	}

	if ( !isFunction( callback ) ) {
		throw new TypeError( 'invalid input argument. Last argument must be a callback function. Value: `' + callback + '`.' );
	}

	let path = ''
	path += uri + '?limit=' + limit + '&offset=' + offset;

	if ( params.filter === 'core' ) {
		path += '&filter=core';
	}

	this.makeHtppRequest( this.buildOptions( path ), callback );
}

ConceptNet.prototype.getURI = function() {
	let args = arguments;
	let nargs = args.length;
	let path;
	let text;
	let language;
	let callback;

	if ( nargs < 2 ) {
		throw new Error( 'insufficient input arguments. Must provide an input text and a callback function.' );
	}

	text = args[ 0 ];
	if ( !isString( text ) ) {
		throw new TypeError( 'invalid input argument. First argument must be a string primitive. Value: `' + text + '`.' );
	}
	if ( nargs < 3 ) {
		language = 'en';
		callback = args[ 1 ];
	} else {
		language = args[ 1 ];
		if ( !isString( language ) ) {
			throw new TypeError( 'invalid input argument. Language argument must be a string primitive. Value: `' + language + '`.' );
		}
		callback = args[ 2 ];
	}
	if ( !isFunction( callback ) ) {
		throw new TypeError( 'invalid input argument. Last argument must be a callback function. Value: `' + callback + '`.' );
	}

	text = text.replace(/\s+/g, '_');
	path = `/c/${language}/${encodeURIComponent( text )}`;
	this.makeHtppRequest( this.buildOptions( path ), callback );
}

ConceptNet.prototype.query = function( params, callback ) {
	if ( !isObject( params ) ) {
		throw new TypeError( 'invalid input argument. First argument must be an parameter object. Value: `' + params + '`.' );
	}
	if ( !isFunction( callback ) ) {
		throw new TypeError( 'invalid input argument. Second argument must be a callback function. Value: `' + callback + '`.' );
	}
	let path = '/query?';
	let str = new URLSearchParams(params);
	path += str;
	this.makeHtppRequest( this.buildOptions( path ), callback );
}

/**
 * Finds concepts similar to a particular concept or list of concepts.
 *
 * @param {string} input - ConceptNet URI or `/list/<language>/<term list>` path
 * @param {Object} [params] - specifies the parameters of the GET request
 * @param {number} [params.limit=10] - number of returned results
 * @param {string} [params.filter=''] - filter out results that don't start with the given URI.
 * @param {Function} callback - callback function
 */
ConceptNet.prototype.related = function() {
	let args = arguments;
	let nargs = args.length;
	let input;
	let params;
	let callback;
	let err;
	let limit;
	let path;

	if ( nargs < 2 ) {
		throw new Error( 'insufficient input arguments. Must provide an input string and a callback function.' );
	}
	input = args[ 0 ];
	if ( nargs < 3 ) {
		params = {};
		callback = args [ 1 ];
	} else {
		params = args[ 1 ];
		if ( !isObject( params ) ) {
			throw new TypeError( 'invalid input argument. Second argument must be an object. Value: `' + params + '`.' );
		}
		callback = args [ 2 ];
	}

	if ( !isFunction( callback ) ) {
		throw new TypeError( 'invalid input argument. Third argument must be a function. Value: `' + callback + '`.' );
	}
	if( !isConceptNetURI( input ) && !isValidTermPath( input ) ) {
		err = new Error( 'The input argument must be either a valid ConceptNet URI or a path of the form ' +
			'/list/<language>/<term list>' );
		throw err;
	}

	limit = params.limit || 10;
	path = '/related' + String( input );

	if ( params.filter ) {
		// if ( isConceptNetURI( params.filter ) ) {
			path += '?filter=' + params.filter + '&limit=' + limit;
		// } else {
		// 	err = new Error( 'The GET argument filter must be a valid ConceptNet URI.' );
		// 	throw err;
		// }
	}
	this.makeHtppRequest( this.buildOptions( path ), callback );
}; // end METHOD association()


/**
 * Finds concepts similar to a particular concept or list of concepts.
 *
 * @param {string} input - ConceptNet URI or `/list/<language>/<term list>` path
 * @param {Object} [params] - specifies the parameters of the GET request
 * @param {number} [params.limit=10] - number of returned results
 * @param {string} [params.filter=''] - filter out results that don't start with the given URI.
 * @param {Function} callback - callback function
 */
ConceptNet.prototype.relatedness = function() {
	let args = arguments;
	let nargs = args.length;
	let input;
	let params;
	let callback;
	let err;
	let limit;
	let path;

	if ( nargs < 2 ) {
		throw new Error( 'insufficient input arguments. Must provide an input string and a callback function.' );
	}
	input = args[ 0 ];
	if ( nargs < 3 ) {
		params = {};
		callback = args [ 1 ];
	} else {
		params = args[ 1 ];
		if ( !isObject( params ) ) {
			throw new TypeError( 'invalid input argument. Second argument must be an object. Value: `' + params + '`.' );
		}
		callback = args [ 2 ];
	}

	if ( !isFunction( callback ) ) {
		throw new TypeError( 'invalid input argument. Third argument must be a function. Value: `' + callback + '`.' );
	}
	if( !isConceptNetURI( input ) && !isValidTermPath( input ) ) {
		err = new Error( 'The input argument must be either a valid ConceptNet URI or a path of the form ' +
			'/list/<language>/<term list>' );
		throw err;
	}

	limit = params.limit || 10;
	path = '/relatedness?' + String( input );

	if ( params.filter ) {
		// if ( isConceptNetURI( params.filter ) ) {
			path += '?filter=' + params.filter + '&limit=' + limit;
		// } else {
		// 	err = new Error( 'The GET argument filter must be a valid ConceptNet URI.' );
		// 	throw err;
		// }
	}
	this.makeHtppRequest( this.buildOptions( path ), callback );
}; // end METHOD association()

/**
 * Performs a HTTP request and invokes the supplied callback function upon completion.
 *
 * @private
 * @param {Object} options - HTTP request options
 * @param {Function} callback - callback function
 */
ConceptNet.prototype.makeHtppRequest = function( options, callback ) {
	console.log(`${this.host}${options.path}`)
	axios.get(`https://api.conceptnet.io${options.path}`)
		.then((result)=>{
			callback(null, result.data)
		})
		.catch(function (error) {
			callback({success: false, status: false, message: error}, null)
		})
		.then(function () {
		});
};

export default ConceptNet;
