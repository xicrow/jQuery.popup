/**
 * cosyPopup
 * @author Jan Ebsen <xicrow@gmail.com>
 * @version 1.0.0
 * @date 2014-02-06
 * @copyright Jan Ebsen 2014
 */
(function($){
	$.cosyPopup = {
		elmPopup : null,
		isVisible : false,
		
		posVer : 'above', // above | below
		posHor : 'right', // right | left
		timeShow : 250,
		timeHide : 150,
		
		// Cache
		cache : {
			// Cache storage
			data : {},
			
			// Get an element from the cache
			get : function(index){
				return $.cosyPopup.cache.data[index];
			},
			
			// Set an element to the cache
			set : function(index, data, callback){
				$.cosyPopup.cache.remove(index);
				$.cosyPopup.cache.data[index] = data;
				if ($.isFunction(callback)){
					callback(data);
				}
			},
			
			// Remove an element from the cache
			remove : function(index){
				delete $.cosyPopup.cache.data[index];
			},
			
			// Check if an element exists in the cache
			exist : function(index){
				return $.cosyPopup.cache.data.hasOwnProperty(index) && $.cosyPopup.cache.data[index] !== null;
			}
		},
		
		init : function(element, content){
			// Check if popup element exists
			if ($.cosyPopup.elmPopup == null){
				// Create popup element
				$.cosyPopup.elmPopup = $('<div></div>')
					.attr('id', 'cosyPopup')
					.css({
						margin : '0px',
						padding : '10px',
						position : 'absolute',
						minWidth : '200px',
						height : 'auto',
						color : '#333',
						backgroundColor : '#FFF',
						visibility : 'hidden',
						zIndex : 1000,
						opacity : 0,
						boxShadow : '0px 0px 5px #222'
					})
					.on('mouseenter', function(){
						$.cosyPopup.show();
					})
					.on('mouseleave', function(){
						$.cosyPopup.hide();
					})
					.appendTo('body');
			}
			
			// Prepare element
			$(element)
				.attr('old-title', element.title)
				.removeAttr('title')
				.on('mouseenter', function(){
					$.cosyPopup.show(this, content);
				})
				.on('mouseleave', function(){
					$.cosyPopup.hide(this);
				});
		},
		
		show : function(element, content){
			// Check if element is an object
			if (typeof(element) == 'object'){
				// Get jQuery element
				var elm = $(element);
				
				// Check if mouse is over element
				if (!elm.is(':hover')){
					// Return void
					return;
				}
				
				if (content == ''){
					content = 'title';
				}
				
				// Get HTML for the popup
				var html;
				
				// If HTML should be retrieved from the HREF attribute
				if (content == 'href'){
					// Get elements HREF
					var url = elm.attr('href');
					
					// Check if url is in cache
					if ($.cosyPopup.cache.exist(url)){
						// Content found in cache, set to popup HTML
						html = $.cosyPopup.cache.get(url);
					}
					else{
						// Set cursor style on the element
						elm.css('cursor', 'progress'); // progress | wait
						
						// Load url with AJAX
						$.ajax({ url : url, type : 'GET', dataType : 'html' })
							.done(function(data){
								// Save to cache
								$.cosyPopup.cache.set(url, data);
							})
							.fail(function(){
								// Save to cache
								$.cosyPopup.cache.set(url, '<p><strong>Error occured</strong><br />Unable to load URL: '+url+'</p>');
							})
							.always(function(){
								// Remove cursor style from the element
								elm.css('cursor', '');
								
								// Show the popup
								$.cosyPopup.show(element, content);
							});
						
						// Return void, don't show the popup untill content is loaded
						return;
					}
				}
				// If HTML should be retrieved from the TITLE attribute
				else if (content == 'title'){
					html = elm.attr('old-title');
				}
				// If HTML is static
				else{
					html = content;
				}
				
				// Set popup HTML
				$.cosyPopup.elmPopup.html(html);
				
				// Set initial popup vertical position
				var posVer = $.cosyPopup.posVer;
				switch ($.cosyPopup.posVer){
					case 'above':
						// Check if there is space for popup above
						if (elm.offset().top < $.cosyPopup.elmPopup.outerHeight(true)){
							// No space for popup above, set to below
							posVer = 'below';
						}
					break;
					case 'below':
						// Check if there is space for popup below
						if (($(window).height() - elm.offset().top - elm.outerHeight(true)) < $.cosyPopup.elmPopup.outerHeight(true)){
							// No space for popup below, set to above
							posVer = 'above';
						}
					break;
				}
				
				// Set initial popup horizontal position
				var posHor = $.cosyPopup.posHor;
				switch ($.cosyPopup.posHor){
					case 'right':
						// Check if there is space for popup right
						if (($(window).width() - elm.offset().left - elm.outerWidth(true)) < $.cosyPopup.elmPopup.outerWidth(true)){
							// No space for popup right, set to left
							posHor = 'left';
						}
					break;
					case 'left':
						// Check if there is space for popup left
						if (elm.offset().left < $.cosyPopup.elmPopup.outerWidth(true)){
							// No space for popup left, set to right
							posHor = 'right';
						}
					break;
				}
				
				// Set CSS for the popup, for the given position
				var css = {
					top : 'auto',
					right : 'auto',
					bottom : 'auto',
					left : 'auto'
				};
				switch (posVer){
					case 'above':
						css.bottom = ($(window).height() - elm.offset().top);
					break;
					case 'below':
						css.top = (elm.offset().top + elm.outerHeight(true));
					break;
				}
				switch (posHor){
					case 'right':
						css.left = elm.offset().left;
					break;
					case 'left':
						css.right = ($(window).width() - elm.offset().left - elm.outerWidth(true));
					break;
				}
				
				// Apply the CSS to the popup
				$.cosyPopup.elmPopup.css(css);
			}
			
			// Set popup to be visible
			$.cosyPopup.isVisible = true;
			
			// Show the popup
			$.cosyPopup.elmPopup.css('visibility', 'visible');
			$.cosyPopup.elmPopup.stop(true, false).animate({ opacity : 1 }, $.cosyPopup.timeShow);
		},
		
		hide : function(elm){
			// Check if popup is visible
			if (!$.cosyPopup.isVisible){
				// Return void
				return;
			}
			
			// Check if element is an object
			if (typeof(elm) == 'object'){
				// ...
			}
			
			// Set popup to not be visible
			$.cosyPopup.isVisible = false;
			
			// Hide the popup
			$.cosyPopup.elmPopup.stop(true, false).animate({ opacity : 0 }, $.cosyPopup.timeHide, function(){ $(this).css('visibility', 'hidden'); });
		}
	};
	
	// Add jQuery instance methods
	$.fn.extend({
		cosyPopup : function(content){
			return this.each(function(){
				$.cosyPopup.init(this, content);
			});
		}
	});
})(jQuery);