'use strict';

// MODULES //

var http = require( 'http' );
var querystring = require( 'querystring' );
var isFunction = require( 'validate.io-function' );
var isObject = require( 'validate.io-object' );
var isString = require( 'validate.io-string-primitive' );


// FUNCTIONS //

/**
* Validates whether the supplied string is a valid ConceptNet URI.
*
* @param {string} uri - input string
* @returns {boolean} true if input is valid URI, false otherwise
*/
function isConceptNetURI( uri ) {
	var  myRegEx = /\/(?:[acdelrs]|and|or)\/[a-zA-Z]{2}\/\w+/;
	return ( myRegEx.test( uri ) ? true : false );
} // end FUNCTION isConceptNetURI()


/**
* Validates whether the supplied string is a valid term path.
*
* @param {string} path - input string
* @returns {boolean} true if input is valid term path, false otherwise
*/
function isValidTermPath( path ) {
	var myRegEx = /\/list\/[a-zA-Z]{2}\/\w+(?:@[-+]?[0-9]*\.?[0-9]+)?(,\w+(?:@[-+]?[0-9]*\.?[0-9]+)?)*/;
	return (myRegEx.test(path) ? true : false);
} // end FUNCTION isValidTermPath()


// CONCEPT NET //

/**
* Creates an instance of the ConceptNet class.
*
* @constructor
* @param {string} [host='conceptnet5.media.mit.edu'] - description
* @param {number} [port=80] - description
* @param {string} [version='5.4'] - description
* @returns {ConceptNet} ConceptNet instance
*/
function ConceptNet( host, port, version ) {
	// If not invoked as a constructor call...
	if ( !(this instanceof ConceptNet) ){
		return new ConceptNet( host, port, version );
	}
	// Set default parameters...
	this.host = host || 'conceptnet5.media.mit.edu';
	this.version = version || '5.4';
	this.port = parseInt( port || 80 );
} // end FUNCTION ConceptNet()


/**
* Build an options object for a HTTP request.
*
* @param {string} path - HTTP request path
* @returns {Object} options object
*/
ConceptNet.prototype.buildOptions = function( path ) {
	var options = {};
	options.hostname = this.host;
	options.port = this.port;
	options.path = path;
	return options;
}; // end METHOD buildOptions()

/**
* Find a ConceptNet object by its URI.
*
* @param {string} uri - ConceptNet URI
* @param {Object} [params] - GET request parameters
* @param {number} [params.limit=50] - number of returned results
* @param {number} [params.offset=0] - number of results to be skipped
* @param {Function} callback - callback function
*/
ConceptNet.prototype.lookup = function() {
	var args = arguments;
	var nargs = args.length;
	var uri;
	var params;
	var callback;
	var limit;
	var offset;

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

	var path = '/data/' + this.version + String( encodeURIComponent( uri ) );
	path += '?limit=' + limit + '&offset=' + offset;

	if ( params.filter === 'core' ) {
		path += '&filter=core';
	}

	this.makeHtppRequest( this.buildOptions( path ), callback );
}; // end METHOD lookup()


/**
* Finds the ConceptNet URI for a given text, applying steps such as reducing English words to their root form.
*
* @param {string} text - input text
* @param {string} [language] - language code
* @param {Function} callback - callback function
* @returns {string} corresponding ConceptNet URI
*/
ConceptNet.prototype.getURI = function() {
	var args = arguments;
	var nargs = args.length;
	var path;
	var text;
	var language;
	var callback;

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
	path = '/data/' + this.version + '/uri?language=' + language + '&text=' + String( encodeURIComponent( text ) );
	this.makeHtppRequest( this.buildOptions( path ), callback );
}; // end METHOD getURI()

/**
* Search ConceptNet edges using multiple requirements.
*
* @param {Object} params - GET request parameters
* @param {Function} callback - callback function
*/
ConceptNet.prototype.search = function( params, callback ) {
	if ( !isObject( params ) ) {
		throw new TypeError( 'invalid input argument. First argument must be an parameter object. Value: `' + params + '`.' );
	}
	if ( !isFunction( callback ) ) {
		throw new TypeError( 'invalid input argument. Second argument must be a callback function. Value: `' + callback + '`.' );
	}
	var path = '/data/' + this.version + '/search?';
	var str = querystring.stringify( params );

	str = querystring.unescape( str );
	path += str;
	this.makeHtppRequest( this.buildOptions( path ), callback );
}; // end METHOD search()

/**
* Finds concepts similar to a particular concept or list of concepts.
*
* @param {string} input - ConceptNet URI or `/list/<language>/<term list>` path
* @param {Object} [params] - specifies the parameters of the GET request
* @param {number} [params.limit=10] - number of returned results
* @param {string} [params.filter=''] - filter out results that don't start with the given URI.
* @param {Function} callback - callback function
*/
ConceptNet.prototype.association = function() {
	var args = arguments;
	var nargs = args.length;
	var input;
	var params;
	var callback;
	var err;
	var limit;
	var path;

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
	path = '/data/' + this.version + '/assoc' + String( input );

	if ( params.filter ) {
		if ( isConceptNetURI( params.filter ) ) {
			path += '?filter=' + params.filter + '&limit=' + limit;
		} else {
			err = new Error( 'The GET argument filter must be a valid ConceptNet URI.' );
			throw err;
		}
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
	var request;

	request = http.request( options, retrieve );
	function retrieve ( response ) {
		var str = '';
		response.on( 'data', function onData( chunk ) {
			str += chunk;
		});
		response.on( 'end', function onEnd() {
			callback( undefined, JSON.parse( str ) );
		});
		response.on( 'error', function onError( error ) {
			callback( error );
		});
	}
	request.on( 'error', function onError( error ) {
		callback( error );
	});
	request.end();
}; // end METHOD makeHtppRequest()


// EXPORTS //

module.exports = ConceptNet;
