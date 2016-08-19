Prism = require( 'prismjs' );
var languages = require( 'prism-languages' );
var path = require( 'path' );
var cheerio = require( 'cheerio' );

var prismDir = require.resolve( "prismjs/prism.js" );

var DEFAULT_LANGUAGE = 'markup';
var MAP_LANGUAGES = {
	'py': 'python',
	'js': 'javascript',
	'json': 'javascript',
	'rb': 'ruby',
	'csharp': 'cs',
	'html': 'markup'
};

var assets = {
	assets: path.dirname( prismDir ),
	css: [ "themes/prism-okaidia.css", "plugins/line-numbers/prism-line-numbers.css" ]
};

module.exports = {
	book: assets,
	ebook: assets,
	hooks:{
		'page' : function( page ){
			$ = cheerio.load( page.content );
			$( "pre > code" ).each( function() {
				$( this ).parent().addClass( "line-numbers" );
				$( this ).parent().addClass( $( this ).attr( "class" ) );
				$( this ).text( $( this ).text() + '<!-- PRISM_LINENOS -->' );
			});
			page.content = $.html();
			return page;
		} 
	},
	blocks: {
    code: function(block) {
		  var highlighted = '';

      // Normalize language id

      var lang = block.kwargs.language || DEFAULT_LANGUAGE;
      lang = MAP_LANGUAGES[lang] || lang;
      if (!languages[lang]) lang = DEFAULT_LANGUAGE;

      // Check against html, prism "markup" works for this
      if (lang === 'html') {
        lang = 'markup';
      }

      block.body = block.body.trim();

      var line_numbers;
      if ( block.body.indexOf( '<!-- PRISM_LINENOS -->' ) > -1 ){
        block.body = block.body.substring( 0, 
          block.body.indexOf( '<!-- PRISM_LINENOS -->' ) );
        block.body = block.body.trim();
        var linesNum = ( block.body.split('\n').length+1 );
        var lines = new Array( linesNum );
        lines = lines.join( '<span></span>' );
        line_numbers = '<span class="line-numbers-rows" aria-hidden="true">' +
          lines + '</span>';
      }


      // if ( block.body.indexOf( "\n" ) === 0 ){
      //   block.body = block.body.substring( 1, block.body.length );
      // }

      // if ( block.body[ block.body.length ] === "\n" ){
      //   block.body = block.body.substring( 0, block.body.length-2 );
      // }

      try {
        // The process can fail (failed to parse)
        highlighted = Prism.highlight( block.body, languages[lang] );
        if ( line_numbers !== undefined ){
        	highlighted = highlighted + line_numbers;
        }
      
      } catch(e) {
        console.warn('Failed to highlight:');
        console.warn(e);
        highlighted = block.body;
      }

      return highlighted;
    }
  }
};
