'use strict';

// MODULES //

var chai = require( 'chai' );
var assert = chai.assert;
var expect = chai.expect;
var ConceptNet = require( '../lib/index.js' );


// TESTS //

describe( 'conceptNet', function tests() {
	describe( 'config', function test() {
		it( 'creates an instance of conceptNet', function test( done ) {
			var cnet = new ConceptNet();
			assert( cnet instanceof ConceptNet );
			done();
		});

		it( 'can be invoked without new', function test( done ) {
			// jshint newcap: false
			var cnet = ConceptNet();
			assert( cnet instanceof ConceptNet );
			done();
		});

		describe( 'defaults', function tests() {
			it( 'has default hostname', function test( done ) {
				var cnet = new ConceptNet();
				assert( cnet.host === 'conceptnet5.media.mit.edu' );
				done();
			});

			it( 'has default port', function test( done ) {
				var cnet = new ConceptNet();
				assert( cnet.port === 80 );
				done();
			});

			it( 'has default version', function test( done ) {
				var cnet = new ConceptNet();
				assert( cnet.version === '5.4' );
				done();
			});
		});

		describe( 'override', function() {
			it( 'has set hostname', function test( done ) {
				var cnet = new ConceptNet( '10.0.0.1', '1234', '5.3' );
				assert( cnet.host === '10.0.0.1' );
				done();
			});

			it( 'has set port', function test( done ) {
				var cnet = new ConceptNet('10.0.0.1','1234','5.3');
				assert( cnet.port === 1234 );
				done();
			});

			it( 'has set version', function test( done ) {
				var cnet = new ConceptNet('10.0.0.1','1234','5.3');
				assert( cnet.version === '5.3' );
				done();
			});

			it( 'only overrides the version', function test( done ) {
				var cnet = new ConceptNet(null, null,'5.3');
				assert( cnet.host === 'conceptnet5.media.mit.edu' );
				assert( cnet.version === '5.3' );
				done();
			});
		});

		describe( '.lookup()', function tests() {

			it( 'throws an error if not supplied at least two arguments', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				expect( badValue() ).to.throw( Error );
				function badValue() {
					return function() {
						cnet.lookup( '/c/en/toast' );
					};
				}
				done();
			});

			it( 'throws an error if URI argument is not a string primitive', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					function(){},
					5,
					true,
					undefined,
					null,
					NaN,
					[],
					{}
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.lookup( value, function(){} );
					};
				}
				done();
			});

			it( 'throws an error if params argument is not an object', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					function(){},
					'5',
					5,
					true,
					undefined,
					null,
					NaN,
					[]
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.lookup( '/c/en/toast', value, function(){} );
					};
				}
				done();
			});

			it( 'throws an error if callback argument is not a function', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					'5',
					5,
					true,
					undefined,
					null,
					NaN,
					[],
					{}
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.lookup( '/c/en/toast', value );
					};
				}
				done();
			});


			it( 'looks up a single concept URI', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				cnet.lookup( '/c/en/toast', {
					offset: 0
				}, function onDone( err, result ) {
					assert( result.numFound > 0 );
					done();
				});
			});

			it( 'looks up a single concept URI with filter', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				cnet.lookup('/c/en/toast',{
					offset: 0,
					filter: 'core'
				}, function onDone( err, result ) {
					assert( result.numFound > 0 );
					done();
				});
			});

			it( 'looks up a single concept URI with custom limit', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				cnet.lookup('/c/en/toast', {
					limit: 2,
					offset: 0,
					filter: 'core'
				}, function onDone( err, result ) {
					assert( result.edges.length === 2 );
					done();
				});
			});

			it( 'handles concepts in other languages', function otherLangTest( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				cnet.lookup('/c/ja/車',{
					filter: 'core'
				}, function onDone( err, result ) {
					assert( result.edges.length === 50 );
					done();
				});
			});
		});

		describe( '.search()', function tests() {

			it( 'throws an error if params argument is not an object', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					'5',
					5,
					true,
					undefined,
					null,
					NaN,
					[],
					function(){}
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.search( value, function onDone(){} );
					};
				}
				done();
			});

			it( 'throws an error if callback argument is not a function', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					'5',
					5,
					true,
					undefined,
					null,
					NaN,
					[],
					{}
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.search( { start: '/c/en/donut' }, value );
					};
				}
				done();
			});

			it( 'is possible to use search method to find ConceptNet edges for multiple requirements', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				cnet.search( { start: '/c/en/donut' }, function onDone( err, result ) {
					assert( result.numFound > 0 );
					done();
				});
			});

		});

		describe( '.getURI()', function tests() {

			it( 'throws an error if not supplied at least two arguments', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				expect( badValue() ).to.throw( Error );
				function badValue() {
					return function() {
						cnet.getURI( 'ground beef' );
					};
				}
				done();
			});

			it( 'throws an error if first argument is not a string primitive', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					function(){},
					5,
					true,
					undefined,
					null,
					NaN,
					[],
					{}
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.getURI( value, function(){} );
					};
				}
				done();
			});

			it( 'throws an error if language argument is not a string primitive', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					function(){},
					5,
					true,
					undefined,
					null,
					NaN,
					[],
					{}
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.getURI( '車', value, function(){} );
					};
				}
				done();
			});

			it( 'throws an error if callback argument is not a function', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					'5',
					5,
					true,
					undefined,
					null,
					NaN,
					[],
					{}
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.getURI( 'ground beef', value );
					};
				}
				done();
			});

			it( 'looks up the ConceptNet URI for text (english)', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				cnet.getURI( 'ground beef', function onDone( err, result ) {
						assert( result.uri === '/c/en/grind_beef' );
						done();
					}
				);
			});

			it( 'looks up the ConceptNet URI for text (foreign language)', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				cnet.getURI( '車', 'ja', function onDone( err, result ) {
						assert( result.uri === '/c/ja/車' );
						done();
					}
				);
			});
		});

		describe( '.association()', function tests() {

			it( 'throws an error if not supplied at least two arguments', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				expect( badValue() ).to.throw( Error );
				function badValue() {
					return function() {
						cnet.association( '/c/en/hotdog' );
					};
				}
				done();
			});

			it( 'throws an error if params argument is not an object', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					function(){},
					'5',
					5,
					true,
					undefined,
					null,
					NaN,
					[]
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.association( '/c/en/hotdog', value, function(){} );
					};
				}
				done();
			});


			it( 'throws an error if callback argument is not a function', function test( done ) {
				this.timeout(2000);
				var cnet = new ConceptNet();
				var values = [
					'5',
					5,
					true,
					undefined,
					null,
					NaN,
					[],
					{}
				];

				for ( var i = 0; i < values.length; i++ ) {
					expect( badValue( values[i] ) ).to.throw( TypeError );
				}
				function badValue( value ) {
					return function() {
						cnet.association( '/c/en/hotdog', {
							filter: '/c/en/donut'
						}, value );
					};
				}
				done();
			});

			it( 'is possible to retrieve associations', function test( done ) {
				this.timeout(3000);
				var cnet = new ConceptNet();
				cnet.association( '/c/en/hotdog', {
					filter: '/c/en/donut'
				},
				function onDone( err, result ) {
					assert( result.similar.length > 0 );
					done();
				});
			});

			it( 'is possible to retrieve associations with limit', function test( done ) {
				this.timeout(3000);
				var cnet = new ConceptNet();
				cnet.association( '/c/en/cat', {
					limit: 1,
					filter: '/c/en/dog'
				}, function onDone( err, result ) {
					assert( result.similar.length === 1 );
					done();
				});
			});

			it( 'is possible to retrieve associations for term list', function test( done ) {
				this.timeout(3000);
				var cnet = new ConceptNet();
				cnet.association( '/list/en/toast,cereal', function onDone( err, result ) {
					assert( result.similar.length > 0 );
					done();
				});
			});

			it( 'throws an error when not supplying concept URI or path to association', function test( done ) {
				this.timeout(3000);
				expect( badValue() ).to.throw( Error );
				function badValue() {
					return function() {
						var cnet = new ConceptNet();
						cnet.association( 'hotdog', {
							limit: 10,
							filter: '/c/en/donut'
						}, function onDone() {} );
					};
				}
				done();
			});

			it( 'throws an error when not supplying concept URI to filter options', function test( done ) {
				this.timeout(3000);
				expect( badValue() ).to.throw( Error );
				function badValue() {
					return function() {
						var cnet = new ConceptNet();
						cnet.association( '/c/en/hotdog', {
							limit: 10,
							filter: 'donut'
						}, function onDone(){} );
					};
				}
				done();
			});
		});

	 });
});
