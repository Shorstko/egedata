(function($) {
	$.fn.JGallery = function(options) {
		var settings = $.extend({
			galleryWidth : 500,
			smallImageHeight : 100,
			smallImageWidth : 100,
			mediumImageHeight : 300,
			mediumImageWidth : 300,
			smallImagesStrech: 'no', // 'no', 'vertical', 'horizontal'
			showCount : false,
			showScroller: false,
			loop : true,
			simpleNav : true,
			images : [],
			smallImages : [],
			mediumImages : [],
			imagesTitles : []
		}, options);
		
		return this.each(function() {
			obj = $(this);
			
			if (settings.smallImages.length == 0)
			{
				settings.smallImages = settings.images;
			}
			if (settings.mediumImages.length == 0)
			{
				settings.mediumImages = settings.images;
			}
			
			var totalImages = settings.smallImages.length;			
			var hasImageTitles = settings.imagesTitles.length != 0;
			var varImages = new Array(totalImages);
			var smallImagesLoadedLeft = totalImages;
			
			var slider;
			var currentImage = 0;
			var currentLargeImage = -1;
			var smallImagesLoaded = new Array(totalImages);
			
			var smallImagesPanelWidth = settings.smallImagesStrech == 'no' ? (totalImages * settings.smallImageWidth + (totalImages - 1) * 7) : 0;
			
			var slideTimeoutId = 0;
			var prevSlideVal = 0;

			$('body').append('<div id="JGallery_overlay"></div><div id="JGallery_popup"><div class="JGallery_imageBack"><img class="JGallery_popupImage" /><div class="JGallery_popupTitle"></div><div class="JGallery_wait"></div><div class="JGallery_download"></div><div class="JGallery_close"></div><div class="JGallery_largeImageLeftArrow"></div><div class="JGallery_largeImageRightArrow"></div><div class="JGallery_largeImageRightPanel"></div><div class="JGallery_largeImageLeftPanel"></div></div></div>');
			obj.prepend('<div class="JGallery_mImageWrapper"><div class="JGallery_mediumImageArrowsLayer"><div class="JGallery_imagesCount"></div><div class="JGallery_mediumImageLeftArrow"></div><div class="JGallery_mediumImageRightArrow"></div></div><div class="JGallery_mediumImageBack"><img /></div><div class="JGallery_mImageTitle"></div></div><div class="JGallery_smallImagesWrapper"><div class="JGallery_leftArrow"></div><div class="JGallery_smallImages"><div class="JGallery_smallImagesListWrapper"><div class="JGallery_smallImagesList"></div></div><div class="JGallery_smallImagesSlidebar"><div class="JGallery_smallImagesSlidebarHandle ui-slider-handle"></div></div></div><div class="JGallery_rightArrow"></div></div>');

			obj.addClass('JGallery_wrapper');
			obj.width(settings.galleryWidth);
			
			if (!settings.showCount)
				obj.find('.JGallery_imagesCount').css('visibility', 'hidden');
				
			
			$('.JGallery_download').click(function() {
				window.open(settings.images[currentLargeImage], '_blank');
			});
			$('.JGallery_close').click(function() {
				$('#JGallery_overlay').css('visibility', 'hidden');
				$('#JGallery_popup').css('visibility', 'hidden');
				
				currentLargeImage = currentImage;
				
				return false;
			});		
			$('.JGallery_largeImageLeftArrow').click(function() {
				selectPrevLargeImage();
			});
			$('.JGallery_largeImageRightArrow').click(function() {
				selectNextLargeImage();
			});
			
			$('.JGallery_largeImageLeftPanel').click(function() {
				selectPrevLargeImage();
			});
			$('.JGallery_largeImageRightPanel').click(function() {
				selectNextLargeImage();
			});			
			
			$('.JGallery_largeImageLeftPanel').hover(
				function() {
					$(this).fadeTo(300, 0.3);
				},
				function() {
					$(this).fadeTo(300, 0);
				}
			);
			$('.JGallery_largeImageRightPanel').hover(
				function() {
					$(this).fadeTo(300, 0.3);
				},
				function() {
					$(this).fadeTo(300, 0);
				}
			);				

			var mediumImageArrowsLayer = obj.find('.JGallery_mediumImageArrowsLayer');
			mediumImageArrowsLayer.height(settings.mediumImageHeight);

			var mediumImageLeftArrow = obj.find('.JGallery_mediumImageLeftArrow');
			mediumImageLeftArrow.height(settings.mediumImageHeight);
			mediumImageLeftArrow.click(function () {
				selectPrevImage();
			});
			if (settings.simpleNav)
			{
				mediumImageLeftArrow.css('visibility', 'hidden');
			}
	
			var mediumImageRightArrow = obj.find('.JGallery_mediumImageRightArrow');
			mediumImageRightArrow.height(settings.mediumImageHeight);
			mediumImageRightArrow.css('left', settings.galleryWidth - mediumImageRightArrow.width());
			mediumImageRightArrow.click(function () {
				selectNextImage();
			});
			if (settings.simpleNav)
			{
				mediumImageRightArrow.css('visibility', 'hidden');
			}
				
			var mediumImageBack = obj.find('.JGallery_mediumImageBack');
			mediumImageBack.width(settings.mediumImageWidth);
			mediumImageBack.height(settings.mediumImageHeight);			
			mediumImageBack.css('margin-left', (settings.galleryWidth - settings.mediumImageWidth) / 2);
			
			var smallImagesListWrapper = obj.find('.JGallery_smallImagesListWrapper');
			smallImagesListWrapper.height(settings.smallImageHeight);
			
			var smallImages = obj.find('.JGallery_smallImages');
			smallImages.width(settings.galleryWidth - obj.find('.JGallery_leftArrow').width() * 2); 
			
			var leftArrow = obj.find('.JGallery_leftArrow');
			leftArrow.height(settings.smallImageHeight);
			var rightArrow = obj.find('.JGallery_rightArrow');
			rightArrow.height(settings.smallImageHeight);
			
			
			if (!settings.simpleNav)
			{
				leftArrow.mousedown(function() {
					slideSmallImagesLeft();
				}).bind('mouseup mouseleave', function() {
					clearTimeout(slideTimeoutId);
				});
			
				rightArrow.mousedown(function() {
					slideSmallImagesRight();
				}).bind('mouseup mouseleave', function() {
					clearTimeout(slideTimeoutId);
				});			
			}
			else
			{
				leftArrow.click(function() {
					selectPrevImage();
				});
				rightArrow.click(function() {
					selectNextImage();
				});				
			}
			
			var smallImagesList = obj.find('.JGallery_smallImagesList');
			smallImagesList.width(smallImagesPanelWidth);
			smallImagesList.height(settings.smallImageHeight);
			for (i=0; i < totalImages; i++)
			{
				insertSmallImage(i);
			}
			
			slider = obj.find('.JGallery_smallImagesSlidebar').slider({
				min: 0,
				max: smallImagesPanelWidth - smallImagesListWrapper.width(),
				step: 5,
				change: function(event, ui) {
					smallImagesList.animate({'margin-left': -1 * ui.value}, Math.abs(prevSlideVal - ui.value) );
					prevSlideVal = ui.value;
				},
				animate: true
			});
			
			if (!settings.showScroller)
				obj.find('.JGallery_smallImagesSlidebar').css('visibility', 'hidden');
			
			selectIndex(0);
			

			function insertSmallImage(index)
			{
				var targetImageK = settings.smallImageWidth / settings.smallImageHeight;
				var div = document.createElement('div');
				if (index % 2)
					$(div).addClass('JGallery_smallImageBack');
				else
					$(div).addClass('JGallery_smallImageBack_odd');
				
				// if (settings.smallimagesstrech != 'vertical')
					// $(div).css('width', settings.smallimagewidth + "px");
				// if (settings.smallimagesstrech != 'horizontal')
					// $(div).css('height', settings.smallimageheight + "px")
				
				var smallImage = $('<img />');
				smallImage.load(function() {
					var imgWidth = this.width;
					var imgHeight = this.height;
					var sourceImageK = imgWidth / imgHeight;
					
					$(this).attr('id', 'JGallery_smallImage-' + index);
					
					$(this).attr('width', null);
					$(this).attr('height', null);
					$(this).css('width', null);
					$(this).css('height', null);
					
					if (settings.smallImagesStrech == 'no')
					{
						if (sourceImageK > targetImageK)
						{
							$(this).attr('width', settings.smallImageWidth);
							$(this).css('top', (settings.smallImageHeight - (settings.smallImageWidth / sourceImageK)) / 2);
						}
						else
						{
							$(this).attr('height', settings.smallImageHeight);
							// $(this).css('left', (settings.smallImageWidth - (settings.smallImageHeight * sourceImageK)) / 2);
						}
					}
					else if (settings.smallImagesStrech == 'vertical')
					{
						$(this).attr('width', settings.smallImageHeight * sourceImageK);
						$(this).attr('height', settings.smallImageHeight);						
					}
					smallImagesPanelWidth += settings.smallImageHeight * sourceImageK;
					smallImagesLoaded[index] = Math.floor(settings.smallImageHeight * sourceImageK);
					
					--smallImagesLoadedLeft;
					

					if (smallImagesLoadedLeft == 0)
					{
						var smallImagesTotalWidth = getSmallImagesTotalWidth();
						if (smallImages.width() >= smallImagesTotalWidth)
						{
							smallImagesListWrapper.css('margin-left', ((smallImages.width() - smallImagesTotalWidth) / 2) + 'px');
							// slider.slider('option', 'max', getSmallImagesTotalWidth() - smallImagesListWrapper.width());
						}							
					}
						
					if (hasImageTitles)
						smallImage.attr('title', settings.imagesTitles[index]);
						

					if (settings.smallImagesStrech == 'vertical') {
						smallImagesList.width(smallImagesPanelWidth);							
						// slider.slider('option', 'max', getSmallImagesTotalWidth() - smallImagesListWrapper.width());
					}

				});
				smallImage.attr('src', settings.smallImages[index]);
				smallImagesList.append(div);		
				$(div).append(smallImage);	

				smallImage.click(function() {
					selectImage(this);
				});
				
				varImages[index] = $(smallImage);
				
				if (index < totalImages - 1)
				{
					div = document.createElement('div');
					$(div).addClass('JGallery_smallImagesSpaceBack');
					smallImagesList.append(div);

					smallImagesPanelWidth += 7;
				}
				
			}				
			 	
			 
			 function selectIndex(index)
			 {
				var mediumImage = obj.find('.JGallery_mImageWrapper img');
				var targetImageK = settings.mediumImageWidth / settings.mediumImageHeight;
				var sourceImageK = 1;
				mediumImage.unbind('load');
				mediumImage.load( function() {
					var imgWidth = this.width;
					var imgHeight = this.height;
					sourceImageK = imgWidth / imgHeight;
				
					$(this).attr('width', null);
					$(this).attr('height', null);
					$(this).css('width', '');
					$(this).css('height', '');				
					$(this).css('top', '');
					$(this).css('left', '');	
					
					if (sourceImageK > targetImageK)
					{
						$(this).attr('width', settings.mediumImageWidth);
						$(this).css('top', (settings.mediumImageHeight - (settings.mediumImageWidth / sourceImageK)) / 2);
					}
					else
					{
						$(this).attr('height', settings.mediumImageHeight);
						$(this).css('left', (settings.mediumImageWidth - (settings.mediumImageHeight * sourceImageK)) / 2);
					}					
					
					if (hasImageTitles)
						$('.JGallery_mImageTitle').text(settings.imagesTitles[index]);
						
					highlightIndex(index);
					updateImagesCount();
				});				
				mediumImage.attr('src', settings.mediumImages[index]);
				
				moveSlider(index);
				currentImage = index;
				currentLargeImage = index;
				mediumImage.unbind('click');
				mediumImage.click( function() {
//					var wait = $('#JGallery_wait');
//					wait.css('visibility', 'visible');
					var overlay = $('#JGallery_overlay');
					overlay.css('visibility', 'visible');
					overlay.unbind('click');
					overlay.click(function() {
						$(this).css('visibility', 'hidden');
						
						var popup = $('#JGallery_popup');
						popup.css('visibility', 'hidden');

						currentLargeImage = currentImage;						
					});
					var popup = $('#JGallery_popup');
					popup.css('visibility', 'visible');
					
					var popupImg = popup.find('.JGallery_popupImage');
					
					
					popupImg.unbind('load');
					popupImg.load(function () {					
						popupImg.attr('width', null);
						popupImg.attr('height', null);
						popupImg.css('width', '');
						popupImg.css('height', '');						
						
						var wndWidth = $(window).width();
						var wndHeight = $(window).height();
						
						var imgWidth = $(this).width();
						var imgHeight = $(this).height();
						
						var wndK = wndWidth / wndHeight;
						var imgK =  imgWidth / imgHeight;
								
						if (wndK > imgK)
						{
							if (wndHeight - 50 < imgHeight)
							{
								imgHeight = (wndHeight - 70);
								imgWidth = (wndHeight - 70) * imgK;
							}
						}
						else
						{
							if (wndWidth - 50 < imgWidth)
							{
								imgWidth = (wndWidth - 70);
								imgHeight = (wndWidth - 70) / imgK;
							}
						}
						
						var largeImageTitle = $('.JGallery_popupTitle');
						largeImageTitle.width(imgWidth);
						if (hasImageTitles)
							largeImageTitle.text(settings.imagesTitles[currentLargeImage]);
						else
							largeImageTitle.text("");						
						
						
						var popupX = (wndWidth - imgWidth - 15) / 2;
						var popupY = (wndHeight - imgHeight - 50) / 2;
						
						$(this).width(imgWidth);
						$(this).height(imgHeight);
						
						$('.JGallery_close').css('left', imgWidth + 15);	
						
						$('.JGallery_largeImageLeftArrow').css('top', (imgHeight - $('.JGallery_largeImageLeftArrow').height()) / 2);
						$('.JGallery_largeImageLeftArrow').css('left', (-$('.JGallery_largeImageLeftArrow').width()));

						$('.JGallery_largeImageRightArrow').css('top', (imgHeight - $('.JGallery_largeImageRightArrow').height()) / 2);
						$('.JGallery_largeImageRightArrow').css('left', (imgWidth) + 15);
						
						$('.JGallery_largeImageLeftPanel').css('top', 7);
						$('.JGallery_largeImageLeftPanel').css('left', 7);
						$('.JGallery_largeImageLeftPanel').css('height', imgHeight);
						$('.JGallery_largeImageLeftPanel').css('width', imgWidth / 2);

						$('.JGallery_largeImageRightPanel').css('top', 7);
						$('.JGallery_largeImageRightPanel').css('height', imgHeight);
						$('.JGallery_largeImageRightPanel').css('width', imgWidth / 2);
						$('.JGallery_largeImageRightPanel').css('left', imgWidth / 2 + 7);							
						
						popup.css('left',popupX);
						popup.css('top',popupY);
						popup.css('visibility', 'visible');
						
//						wait.css('visibility', 'hidden');
					});
					popupImg.attr('src', settings.images[currentImage]);
				});
			 }
			 
			 function selectImage(image)
			 {
				var index = parseInt($(image).attr('id').split('-')[1]);
				
				selectIndex(index);
			 }
			 
			 function moveSlider(index)
			 {
				var panelCenterPosX = (smallImagesListWrapper.width() - smallImagesLoaded[index]) / 2;
				// var panelCenterPosXC = panelCenterPosX + smallImagesLoaded[index] / 2;
				
				var imagePosX = getImageOffset(index);
				
				var resultOffsetX = 0;
				if (imagePosX >= panelCenterPosX)
				{
					resultOffsetX = imagePosX - panelCenterPosX;
				} 
				
				var smallImagesTotalWidth = getSmallImagesTotalWidth();
				if ((smallImagesTotalWidth - imagePosX) < (smallImagesListWrapper.width() - panelCenterPosX))
				{
					resultOffsetX = imagePosX - panelCenterPosX - ((smallImagesListWrapper.width() - panelCenterPosX) -(smallImagesTotalWidth - imagePosX));
				}

				$('.JGallery_smallImagesSlidebar').slider('value', resultOffsetX);			 
			 }
			 
			 function slideSmallImagesLeft()
			 {
				slider.slider('value', slider.slider('value') - 10);	
				slideTimeoutId = setTimeout(slideSmallImagesLeft, 30);				
			 }
			 
			 function slideSmallImagesRight()
			 {		 
				slider.slider('value', slider.slider('value') + 10);	
				slideTimeoutId = setTimeout(slideSmallImagesRight, 30);				
			 }	

			function getImageOffset(index)
			{
				var result = 0;
				for(var i=0; i<index; i++)
				{
					result += smallImagesLoaded[i];
					result += 7;
				}
				
				return result;
			}
			
			function getSmallImagesTotalWidth()
			{
				var result = 0;
				for(var i=0; i<smallImagesLoaded.length-1; i++)
				{
					result += smallImagesLoaded[i];
					result += 7;
				}
				result += smallImagesLoaded[smallImagesLoaded.length - 1] + 2;		
					
				return result;
			}			
			
			function selectNextImage()
			{
				if (currentImage == (totalImages - 1))
				{
					if (!settings.loop)
						return;
					else
						currentImage = 0;
				}
				else
				{										
					++currentImage;
				}
				
				selectIndex(currentImage);
			}
			
			function selectPrevImage()
			{
				if (currentImage == 0)
				{
					if (!settings.loop)
						return;
					else
						currentImage = totalImages - 1;
				}
				else
				{
					--currentImage;
				}
				
				selectIndex(currentImage);
			}		

			function highlightIndex(index)
			{
				for (var i=0; i<varImages.length; ++i)
				{
					if (i == index)
						varImages[i].fadeTo(500, 1);
					else
						varImages[i].fadeTo(500, 0.5);
				}
			}	

			function updateImagesCount()
			{
				var text = (currentImage + 1) + "/" + totalImages;
				var imagesCount = obj.find(".JGallery_imagesCount");
				imagesCount.text(text);
			}			
			
			function selectPrevLargeImage()
			{
					if (currentLargeImage == 0)
					{
						if (!settings.loop)
							return;
						else
							currentLargeImage = totalImages - 1;
					}
					else
					{										
						--currentLargeImage;
					}
									
					var popup = $('#JGallery_popup');

					var popupImg = popup.find('.JGallery_popupImage');
					
					popupImg.unbind('load');
					popupImg.load(function () {					
						popupImg.attr('width', null);
						popupImg.attr('height', null);
						popupImg.css('width', '');
						popupImg.css('height', '');						
						
						var wndWidth = $(window).width();
						var wndHeight = $(window).height();
						
						var imgWidth = $(this).width();
						var imgHeight = $(this).height();
						
						var wndK = wndWidth / wndHeight;
						var imgK =  imgWidth / imgHeight;
								
						if (wndK > imgK)
						{
							if (wndHeight - 50 < imgHeight)
							{
								imgHeight = (wndHeight - 70);
								imgWidth = (wndHeight - 70) * imgK;
							}
						}
						else
						{
							if (wndWidth - 50 < imgWidth)
							{
								imgWidth = (wndWidth - 70);
								imgHeight = (wndWidth - 70) / imgK;
							}
						}
						
						var largeImageTitle = $('.JGallery_popupTitle');
						largeImageTitle.width(imgWidth);
						if (hasImageTitles)
							largeImageTitle.text(settings.imagesTitles[currentLargeImage]);
						else
							largeImageTitle.text("");						
						
						
						var popupX = (wndWidth - imgWidth - 15) / 2;
						var popupY = (wndHeight - imgHeight - 50) / 2;

						
						$(this).width(imgWidth);
						$(this).height(imgHeight);
						
						$('.JGallery_close').css('left', imgWidth + 15);	
						
						$('.JGallery_largeImageLeftArrow').css('top', (imgHeight - $('.JGallery_largeImageLeftArrow').height()) / 2);
						$('.JGallery_largeImageLeftArrow').css('left', (-$('.JGallery_largeImageLeftArrow').width()));

						$('.JGallery_largeImageRightArrow').css('top', (imgHeight - $('.JGallery_largeImageRightArrow').height()) / 2);
						$('.JGallery_largeImageRightArrow').css('left', (imgWidth) + 15);
						
						$('.JGallery_largeImageLeftPanel').css('top', 7);
						$('.JGallery_largeImageLeftPanel').css('left', 7);
						$('.JGallery_largeImageLeftPanel').css('height', imgHeight);
						$('.JGallery_largeImageLeftPanel').css('width', imgWidth / 2);

						$('.JGallery_largeImageRightPanel').css('top', 7);
						$('.JGallery_largeImageRightPanel').css('height', imgHeight);
						$('.JGallery_largeImageRightPanel').css('width', imgWidth / 2);
						$('.JGallery_largeImageRightPanel').css('left', imgWidth / 2 + 7);					
						
						popup.css('left',popupX);
						popup.css('top',popupY);
						popup.css('visibility', 'visible');
						
					});
					popupImg.attr('src', settings.images[currentLargeImage]);	
					selectIndex(currentLargeImage);					
			}
			
			function selectNextLargeImage()
			{
					if (currentLargeImage == (totalImages - 1))
					{
						if (!settings.loop)
							return;
						else
							currentLargeImage = 0;
					}
					else
					{										
						++currentLargeImage;
					}
			
					var popup = $('#JGallery_popup');

					var popupImg = popup.find('.JGallery_popupImage');
					
					popupImg.unbind('load');
					popupImg.load(function () {					
						popupImg.attr('width', null);
						popupImg.attr('height', null);
						popupImg.css('width', '');
						popupImg.css('height', '');						
						
						var wndWidth = $(window).width();
						var wndHeight = $(window).height();
						
						var imgWidth = $(this).width();
						var imgHeight = $(this).height();
						
						var wndK = wndWidth / wndHeight;
						var imgK =  imgWidth / imgHeight;
								
						if (wndK > imgK)
						{
							if (wndHeight - 50 < imgHeight)
							{
								imgHeight = (wndHeight - 70);
								imgWidth = (wndHeight - 70) * imgK;
							}
						}
						else
						{
							if (wndWidth - 50 < imgWidth)
							{
								imgWidth = (wndWidth - 70);
								imgHeight = (wndWidth - 70) / imgK;
							}
						}
						
						var largeImageTitle = $('.JGallery_popupTitle');
						largeImageTitle.width(imgWidth);
						if (hasImageTitles)
							largeImageTitle.text(settings.imagesTitles[currentLargeImage]);
						else
							largeImageTitle.text("");						
						
						
						var popupX = (wndWidth - imgWidth - 15) / 2;
						var popupY = (wndHeight - imgHeight - 50) / 2;

						
						$(this).width(imgWidth);
						$(this).height(imgHeight);
						
						$('.JGallery_close').css('left', imgWidth + 15);	
						
						$('.JGallery_largeImageLeftArrow').css('top', (imgHeight - $('.JGallery_largeImageLeftArrow').height()) / 2);
						$('.JGallery_largeImageLeftArrow').css('left', (-$('.JGallery_largeImageLeftArrow').width()));

						$('.JGallery_largeImageRightArrow').css('top', (imgHeight - $('.JGallery_largeImageRightArrow').height()) / 2);
						$('.JGallery_largeImageRightArrow').css('left', (imgWidth) + 15);
						
						$('.JGallery_largeImageLeftPanel').css('top', 7);
						$('.JGallery_largeImageLeftPanel').css('left', 7);
						$('.JGallery_largeImageLeftPanel').css('height', imgHeight);
						$('.JGallery_largeImageLeftPanel').css('width', imgWidth / 2);

						$('.JGallery_largeImageRightPanel').css('top', 7);
						$('.JGallery_largeImageRightPanel').css('height', imgHeight);
						$('.JGallery_largeImageRightPanel').css('width', imgWidth / 2);
						$('.JGallery_largeImageRightPanel').css('left', imgWidth / 2 + 7);				

						
						popup.css('left',popupX);
						popup.css('top',popupY);
						popup.css('visibility', 'visible');
						
					});
					popupImg.attr('src', settings.images[currentLargeImage]);
						
					selectIndex(currentLargeImage);
			}
		});
	};
}) (jQuery);