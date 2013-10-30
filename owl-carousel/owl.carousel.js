/*
 *	jQuery OwlCarousel v1.28
 *
 *	Copyright (c) 2013 Bartosz Wojciechowski
 *	http://www.owlgraphic.com/owlcarousel/
 *
 *	Licensed under MIT
 *
 */
'use strict';
(function($, undefined) {

	var Carousel = (function() {
		function Carousel(options, el) {
			this.$elem = $(el);
			
			// options passed via js override options passed via data attributes
			this.options = $.extend({}, $.fn.owlCarousel.options, this.$elem.data() ,options);

			this.userOptions = options;
			this.loadContent();
		}

		Carousel.prototype.loadContent = function() {
			var base = this;

			if (typeof this.options.beforeInit === "function") {
				this.options.beforeInit.call(this, this.$elem);
			}

			if (typeof this.options.jsonPath === "string") {
				$.getJSON(this.options.jsonPath).done(function(data) {
					if (typeof base.options.jsonSuccess === "function") {
						base.options.jsonSuccess.call(this, data);
					} else {
						var content = "";
						for (var i in data.owl) {
							content += data.owl[i].item;
						}
						base.$elem.html(content);
					}
					base.logIn();
				});
			} else {
				this.logIn();
			}
		};

		Carousel.prototype.logIn = function(action) {
			this.$elem.css({opacity: 0});
			this.orignalItems = this.options.items;
			this.checkBrowser();
			this.wrapperWidth = 0;
			// this.checkVisible;
			this.setVars();
		};

		Carousel.prototype.setVars = function() {
			if (this.$elem.children().length === 0) {
				return false;
			}
			this.baseClass();
			this.eventTypes();
			this.$userItems = this.$elem.children();
			this.itemsAmount = this.$userItems.length;
			this.wrapItems();
			this.$owlItems = this.$elem.find(".owl-item");
			this.$owlWrapper = this.$elem.find(".owl-wrapper");
			this.playDirection = "next";
			this.prevItem = 0; //this.options.startPosition;
			this.currentItem = 0; //Starting Position
			this.customEvents();
			this.onStartup();
		};

		Carousel.prototype.onStartup = function() {
			this.updateItems();
			this.calculateAll();
			this.buildControls();
			this.updateControls();
			this.response();
			this.moveEvents();
			this.stopOnHover();
			this.owlStatus();

			if (this.options.transitionStyle !== false) {
				this.transitionTypes(this.options.transitionStyle);
			}
			if (this.options.autoPlay === true) {
				this.options.autoPlay = 5000;
			}
			this.play();

			this.$elem.find(".owl-wrapper").css("display", "block");

			if (!this.$elem.is(":visible")) {
				this.watchVisibility();
			} else {
				this.$elem.css("opacity", 1);
			}
			this.onstartup = false;
			this.eachMoveUpdate();
			if (typeof this.options.afterInit === "function") {
				this.options.afterInit.call(this, this.$elem);
			}
		};

		Carousel.prototype.eachMoveUpdate = function() {
			if (this.options.lazyLoad === true) {
				this.lazyLoad();
			}
			if (this.options.autoHeight === true) {
				this.autoHeight();
			}
			if (this.options.addClassActive === true) {
				this.addClassActive();
			}
			if (typeof this.options.afterAction === "function") {
				this.options.afterAction.call(this, this.$elem);
			}
		};

		Carousel.prototype.updateVars = function() {
			if (typeof this.options.beforeUpdate === "function") {
				this.options.beforeUpdate.call(this, this.$elem);
			}
			this.watchVisibility();
			this.updateItems();
			this.calculateAll();
			this.updatePosition();
			this.updateControls();
			this.eachMoveUpdate();
			if (typeof this.options.afterUpdate === "function") {
				this.options.afterUpdate.call(this, this.$elem);
			}
		};

		Carousel.prototype.reload = function(elements) {
			var base = this;
			setTimeout(function() {
				base.updateVars();
			}, 0);
		};

		Carousel.prototype.watchVisibility = function() {
			var base = this;

			if (this.$elem.is(":visible") === false) {
				this.$elem.css({opacity: 0});
				clearInterval(this.autoPlayInterval);
				clearInterval(this.checkVisible);
			} else {
				return false;
			}
			this.checkVisible = setInterval(function() {
				if (base.$elem.is(":visible")) {
					base.reload();
					base.$elem.animate({opacity: 1}, 200);
					clearInterval(base.checkVisible);
				}
			}, 500);
		};

		Carousel.prototype.wrapItems = function() {
			this.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
			this.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
			this.wrapperOuter = this.$elem.find(".owl-wrapper-outer");
			this.$elem.css("display", "block");
		};

		Carousel.prototype.baseClass = function() {
			var hasBaseClass = this.$elem.hasClass(this.options.baseClass);
			var hasThemeClass = this.$elem.hasClass(this.options.theme);
			this.$elem.data("owl-originalStyles", this.$elem.attr("style"))
				.data("owl-originalClasses", this.$elem.attr("class"));

			if (!hasBaseClass) {
				this.$elem.addClass(this.options.baseClass);
			}

			if (!hasThemeClass) {
				this.$elem.addClass(this.options.theme);
			}
		};

		Carousel.prototype.updateItems = function() {
			if (this.options.responsive === false) {
				return false;
			}
			if (this.options.singleItem === true) {
				this.options.items = this.orignalItems = 1;
				this.options.itemsDesktop = false;
				this.options.itemsDesktopSmall = false;
				this.options.itemsTablet = false;
				this.options.itemsTabletSmall = false;
				this.options.itemsMobile = false;
				return false;
			}

			var width = $(this.options.responsiveBaseWidth).width();

			if (width > (this.options.itemsDesktop[0] || this.orignalItems)) {
				this.options.items = this.orignalItems;
			}

			if (width <= this.options.itemsDesktop[0] && this.options.itemsDesktop !== false) {
				this.options.items = this.options.itemsDesktop[1];
			}

			if (width <= this.options.itemsDesktopSmall[0] && this.options.itemsDesktopSmall !== false) {
				this.options.items = this.options.itemsDesktopSmall[1];
			}

			if (width <= this.options.itemsTablet[0]  && this.options.itemsTablet !== false) {
				this.options.items = this.options.itemsTablet[1];
			}

			if (width <= this.options.itemsTabletSmall[0]  && this.options.itemsTabletSmall !== false) {
				this.options.items = this.options.itemsTabletSmall[1];
			}

			if (width <= this.options.itemsMobile[0] && this.options.itemsMobile !== false) {
				this.options.items = this.options.itemsMobile[1];
			}

			//if number of items is less than declared
			if (this.options.items > this.itemsAmount && this.options.itemsScaleUp === true) {
				this.options.items = this.itemsAmount;
			}
		};

		Carousel.prototype.response = function() {
			var base = this,
				smallDelay;
			if (this.options.responsive !== true) {
				return false;
			}
			var lastWindowWidth = $(window).width();

			this.resizer = function() {
				if ($(window).width() !== lastWindowWidth) {
					if (base.options.autoPlay !== false) {
						clearInterval(base.autoPlayInterval);
					}
					clearTimeout(smallDelay);
					smallDelay = setTimeout(function() {
						lastWindowWidth = $(window).width();
						base.updateVars();
					}, base.options.responsiveRefreshRate);
				}
			};
			$(window).resize(this.resizer);
		};

		Carousel.prototype.updatePosition = function() {
			if (this.browser.support3d === true) {
				if (this.positionsInArray[this.currentItem] > this.maximumPixels) {
					this.transition3d(this.positionsInArray[this.currentItem]);
				} else {
					this.transition3d(0);
					this.currentItem = 0;
				}
			} else {
				if (this.positionsInArray[this.currentItem] > this.maximumPixels) {
					this.css2slide(this.positionsInArray[this.currentItem]);
				} else {
					this.css2slide(0);
					this.currentItem = 0;
				}
			}
			if (this.options.autoPlay !== false) {
				this.checkAp();
			}
		};

		Carousel.prototype.appendItemsSizes = function() {
			var roundPages = 0;
			var lastItem = this.itemsAmount - this.options.items;

			this.$owlItems.each(function(index) {
				var $this = $(this);
				$this.css({width: base.itemWidth})
					.data("owl-item", Number(index));

				if (index % base.options.items === 0 || index === lastItem) {
					if (index <= lastItem) {
						roundPages += 1;
					}
				}
				$this.data("owl-roundPages", roundPages);
			});
		};

		Carousel.prototype.appendWrapperSizes = function() {
			var width = this.$owlItems.length * this.itemWidth;

			this.$owlWrapper.css({
				width: width * 2,
				left: 0
			});
			this.appendItemsSizes();
		};

		Carousel.prototype.calculateAll = function() {
			this.calculateWidth();
			this.appendWrapperSizes();
			this.loops();
			this.max();
		};

		Carousel.prototype.calculateWidth = function() {
			this.itemWidth = Math.round(this.$elem.width() / this.options.items);
		};

		Carousel.prototype.max = function() {
			this.maximumItem = this.itemsAmount - this.options.items;
			var maximum = ((this.itemsAmount * this.itemWidth) - this.options.items * this.itemWidth) * -1;
			if (this.options.items > this.itemsAmount) {
				maximum = 0;
				this.maximumItem = 0;
				this.maximumPixels = 0;
			} else {
				this.maximumItem = this.itemsAmount - this.options.items;
				this.maximumPixels = maximum;
			}
			return maximum;
		};

		Carousel.prototype.min = function() {
			return 0;
		};

		Carousel.prototype.loops = function() {
			var base = this;

			base.positionsInArray = [0];
			var elWidth = 0;

			for (var i=0; i < base.itemsAmount; i++) {
				elWidth += base.itemWidth;
				base.positionsInArray.push(-elWidth);
			}
		};

		Carousel.prototype.buildControls = function() {
			var base = this;
			if (base.options.navigation === true || base.options.pagination === true) {
				base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
			}
			if (base.options.pagination === true) {
				base.buildPagination();
			}
			if (base.options.navigation === true) {
				base.buildButtons();
			}
		};

		Carousel.prototype.buildButtons = function() {
			var base = this;
			var buttonsWrapper = $("<div class=\"owl-buttons\"/>");
			base.owlControls.append(buttonsWrapper);

			base.buttonPrev = $("<div/>", {
				"class": "owl-prev",
				"html": base.options.navigationText[0] || ""
			});

			base.buttonNext = $("<div/>", {
				"class": "owl-next",
				"html": base.options.navigationText[1] || ""
			});

			buttonsWrapper
			.append(base.buttonPrev)
			.append(base.buttonNext);

			buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function(event) {
				event.preventDefault();
				if ($(this).hasClass("owl-next")) {
					base.next();
				} else{
					base.prev();
				}
			});
		};

		Carousel.prototype.buildPagination = function() {
			var base = this;

			base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
			base.owlControls.append(base.paginationWrapper);

			base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function(event) {
				event.preventDefault();
				if (Number($(this).data("owl-page")) !== base.currentItem) {
					base.goTo(Number($(this).data("owl-page")), true);
				}
			});
		};

		Carousel.prototype.updatePagination = function() {
			var base = this;
			if (base.options.pagination === false) {
				return false;
			}

			base.paginationWrapper.html("");

			var counter = 0,
				lastItem,
				lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

			for (var i = 0; i<base.itemsAmount; i++) {
				if (i % base.options.items === 0) {
					counter +=1;
					if (lastPage === i) {
						lastItem = base.itemsAmount - base.options.items;
					}
					var paginationButton = $("<div/>", {
						"class": "owl-page"
					});
					var paginationButtonInner = $("<span></span>", {
						"text": base.options.paginationNumbers === true ? counter : "",
						"class": base.options.paginationNumbers === true ? "owl-numbers" : ""
					});
					paginationButton.append(paginationButtonInner);

					paginationButton.data("owl-page", lastPage === i ? lastItem : i);
					paginationButton.data("owl-roundPages", counter);

					base.paginationWrapper.append(paginationButton);
				}
			}
			base.checkPagination();
		};
		Carousel.prototype.checkPagination = function() {
			var base = this;
			if (base.options.pagination === false) {
				return false;
			}
			base.paginationWrapper.find(".owl-page").each(function(i, v) {
				if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
					base.paginationWrapper
						.find(".owl-page")
						.removeClass("active");
					$(this).addClass("active");
				}
			});
		};

		Carousel.prototype.checkNavigation = function() {
			var base = this;

			if (base.options.navigation === false) {
				return false;
			}
			if (base.options.rewindNav === false) {
				if (base.currentItem === 0 && base.maximumItem === 0) {
					base.buttonPrev.addClass("disabled");
					base.buttonNext.addClass("disabled");
				} else if (base.currentItem === 0 && base.maximumItem !== 0) {
					base.buttonPrev.addClass("disabled");
					base.buttonNext.removeClass("disabled");
				} else if (base.currentItem === base.maximumItem) {
					base.buttonPrev.removeClass("disabled");
					base.buttonNext.addClass("disabled");
				} else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
					base.buttonPrev.removeClass("disabled");
					base.buttonNext.removeClass("disabled");
				}
			}
		};

		Carousel.prototype.updateControls = function() {
			var base = this;
			base.updatePagination();
			base.checkNavigation();
			if (base.owlControls) {
				if (base.options.items >= base.itemsAmount) {
					base.owlControls.hide();
				} else {
					base.owlControls.show();
				}
			}
		};

		Carousel.prototype.destroyControls = function() {
			var base = this;
			if (base.owlControls) {
				base.owlControls.remove();
			}
		};

		Carousel.prototype.next = function(speed) {
			var base = this;

			if (base.isTransition) {
				return false;
			}

			base.storePrevItem = base.currentItem;

			base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
			if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
				if (base.options.rewindNav === true) {
					base.currentItem = 0;
					speed = "rewind";
				} else {
					base.currentItem = base.maximumItem;
					return false;
				}
			}
			base.goTo(base.currentItem, speed);
		};

		Carousel.prototype.prev = function(speed) {
			var base = this;

			if (base.isTransition) {
				return false;
			}

			base.storePrevItem = base.currentItem;

			if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
				base.currentItem = 0;
			} else {
				base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
			}
			if (base.currentItem < 0) {
				if (base.options.rewindNav === true) {
					base.currentItem = base.maximumItem;
					speed = "rewind";
				} else {
					base.currentItem = 0;
					return false;
				}
			}
			base.goTo(base.currentItem, speed);
		};

		Carousel.prototype.goTo = function(position, speed, drag) {
			var base = this;

			if (base.isTransition) {
				return false;
			}
			base.getPrevItem();
			if (typeof base.options.beforeMove === "function") {
				base.options.beforeMove.call(this, base.$elem);
			}
			if (position >= base.maximumItem) {
				position = base.maximumItem;
			}
			else if (position <= 0) {
				position = 0;
			}

			base.currentItem = base.owl.currentItem = position;
			if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
				base.swapSpeed(0);
				if (base.browser.support3d === true) {
					base.transition3d(base.positionsInArray[position]);
				} else {
					base.css2slide(base.positionsInArray[position], 1);
				}
				base.singleItemTransition();
				base.afterGo();
				return false;
			}
			var goToPixel = base.positionsInArray[position];

			if (base.browser.support3d === true) {
				base.isCss3Finish = false;

				if (speed === true) {
					base.swapSpeed("paginationSpeed");
					setTimeout(function() {
						base.isCss3Finish = true;
					}, base.options.paginationSpeed);

				} else if (speed === "rewind") {
					base.swapSpeed(base.options.rewindSpeed);
					setTimeout(function() {
						base.isCss3Finish = true;
					}, base.options.rewindSpeed);

				} else {
					base.swapSpeed("slideSpeed");
					setTimeout(function() {
						base.isCss3Finish = true;
					}, base.options.slideSpeed);
				}
				base.transition3d(goToPixel);
			} else {
				if (speed === true) {
					base.css2slide(goToPixel, base.options.paginationSpeed);
				} else if (speed === "rewind") {
					base.css2slide(goToPixel, base.options.rewindSpeed);
				} else {
					base.css2slide(goToPixel, base.options.slideSpeed);
				}
			}
			base.afterGo();
		};

		Carousel.prototype.getPrevItem = function() {
			var base = this;
			base.prevItem = base.owl.prevItem = base.storePrevItem === undefined ? base.currentItem : base.storePrevItem;
			base.storePrevItem = undefined;
		};

		Carousel.prototype.jumpTo = function(position) {
			var base = this;
			base.getPrevItem();
			if (typeof base.options.beforeMove === "function") {
				base.options.beforeMove.call(this, base.$elem);
			}
			if (position >= base.maximumItem || position === -1) {
				position = base.maximumItem;
			}
			else if (position <= 0) {
				position = 0;
			}
			base.swapSpeed(0);
			if (base.browser.support3d === true) {
				base.transition3d(base.positionsInArray[position]);
			} else {
				base.css2slide(base.positionsInArray[position], 1);
			}
			base.currentItem = base.owl.currentItem = position;
			base.afterGo();
		};

		Carousel.prototype.afterGo = function() {
			var base = this;
			base.checkPagination();
			base.checkNavigation();
			base.eachMoveUpdate();

			if (typeof base.options.afterMove === "function") {
				base.options.afterMove.call(this, base.$elem);
			}
			if (base.options.autoPlay !== false) {
				base.checkAp();
			}
		};

		Carousel.prototype.stop = function() {
			var base = this;
			base.apStatus = "stop";
			clearInterval(base.autoPlayInterval);
		};

		Carousel.prototype.checkAp = function() {
			var base = this;
			if (base.apStatus !== "stop") {
				base.play();
			}
		};

		Carousel.prototype.play = function() {
			var base = this;
			base.apStatus = "play";
			if (base.options.autoPlay === false) {
				return false;
			}
			clearInterval(base.autoPlayInterval);
			base.autoPlayInterval = setInterval(function() {
				base.next(true);
			}, base.options.autoPlay);
		};

		Carousel.prototype.swapSpeed = function(action) {
			var base = this;
			if (action === "slideSpeed") {
				base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
			} else if (action === "paginationSpeed") {
				base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
			} else if (typeof action !== "string") {
				base.$owlWrapper.css(base.addCssSpeed(action));
			}
		};

		Carousel.prototype.addCssSpeed = function(speed) {
			var base = this;
			return {
				"-webkit-transition": "all "+ speed +"ms ease",
				"-moz-transition": "all "+ speed +"ms ease",
				"-o-transition": "all "+ speed +"ms ease",
				"transition": "all "+ speed +"ms ease"
			};
		};

		Carousel.prototype.removeTransition = function() {
			return {
				"-webkit-transition": "",
				"-moz-transition": "",
				"-o-transition": "",
				"transition": ""
			};
		};

		Carousel.prototype.doTranslate = function(pixels) {
			return {
				"-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
				"-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
				"-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
				"-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
				"transform": "translate3d(" + pixels + "px, 0px, 0px)"
			};
		};

		Carousel.prototype.transition3d = function(value) {
			var base = this;
			base.$owlWrapper.css(base.doTranslate(value));
		};

		Carousel.prototype.css2move = function(value) {
			var base = this;
			base.$owlWrapper.css({left: value});
		};

		Carousel.prototype.css2slide = function(value, speed) {
			var base = this;

			base.isCssFinish = false;
			base.$owlWrapper.stop(true, true).animate({
				left: value
			}, {
				duration: speed || base.options.slideSpeed,
				complete: function() {
					base.isCssFinish = true;
				}
			});
		};

		Carousel.prototype.checkBrowser = function() {
			var base = this;

			//Check 3d support
			var	translate3D = "translate3d(0px, 0px, 0px)",
				tempElem = document.createElement("div");

			tempElem.style.cssText = " -moz-transform:"    + translate3D +
									"; -ms-transform:"     + translate3D +
									"; -o-transform:"      + translate3D +
									"; -webkit-transform:" + translate3D +
									"; transform:"         + translate3D;
			var	regex = /translate3d\(0px, 0px, 0px\)/g,
				asSupport = tempElem.style.cssText.match(regex),
				support3d = (asSupport !== null && asSupport.length === 1);

			var isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints;

			base.browser = {
				support3d: support3d,
				isTouch: isTouch
			};
		};

		Carousel.prototype.moveEvents = function() {
			var base = this;
			if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
				base.gestures();
				base.disabledEvents();
			}
		};

		Carousel.prototype.eventTypes = function() {
			var base = this;
			var types = ["s", "e", "x"];

			base.ev_types = {};

			if (base.options.mouseDrag === true && base.options.touchDrag === true) {
				types = [
					"touchstart.owl mousedown.owl",
					"touchmove.owl mousemove.owl",
					"touchend.owl touchcancel.owl mouseup.owl"
				];
			} else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
				types = [
					"touchstart.owl",
					"touchmove.owl",
					"touchend.owl touchcancel.owl"
				];
			} else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
				types = [
					"mousedown.owl",
					"mousemove.owl",
					"mouseup.owl"
				];
			}

			base.ev_types.start = types[0];
			base.ev_types.move = types[1];
			base.ev_types.end = types[2];
		};

		Carousel.prototype.disabledEvents = function() {
			var base = this;
			base.$elem.on("dragstart.owl", function(event) {
				event.preventDefault();
			});
			base.$elem.on("mousedown.disableTextSelect", function(e) {
				return $(e.target).is('input, textarea, select, option');
			});
		};

		Carousel.prototype.gestures = function() {
			var base = this;

			var locals = {
				offsetX: 0,
				offsetY: 0,
				baseElWidth: 0,
				relativePos: 0,
				position: null,
				minSwipe: null,
				maxSwipe: null,
				sliding: null,
				dargging: null,
				targetElement: null
			};

			base.isCssFinish = true;

			function getTouches(event) {
				if (event.touches) {
					return {
						x: event.touches[0].pageX,
						y: event.touches[0].pageY
					};
				} else {
					if (event.pageX !== undefined) {
						return {
							x: event.pageX,
							y: event.pageY
						};
					} else {
						return {
							x: event.clientX,
							y: event.clientY
						};
					}
				}
			}

			function swapEvents(type) {
				if (type === "on") {
					$(document).on(base.ev_types.move, dragMove);
					$(document).on(base.ev_types.end, dragEnd);
				} else if (type === "off") {
					$(document).off(base.ev_types.move);
					$(document).off(base.ev_types.end);
				}
			}

			function dragStart(e) {
				var event = e.originalEvent || e || window.event;

				if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
					return false;
				}
				if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
					return false;
				}

				if (base.options.autoPlay !== false) {
					clearInterval(base.autoPlayInterval);
				}

				if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
					base.$owlWrapper.addClass("grabbing");
				}

				base.newPosX = 0;
				base.newRelativeX = 0;

				$(this).css(base.removeTransition());

				var position = $(this).position();
				locals.relativePos = position.left;

				locals.offsetX = getTouches(event).x - position.left;
				locals.offsetY = getTouches(event).y - position.top;

				swapEvents("on");

				locals.sliding = false;
				locals.targetElement = event.target || event.srcElement;
			}

			function dragMove(e) {
				var event = e.originalEvent || e || window.event;

				base.newPosX = getTouches(event).x- locals.offsetX;
				base.newPosY = getTouches(event).y - locals.offsetY;
				base.newRelativeX = base.newPosX - locals.relativePos;

				if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
					locals.dragging = true;
					base.options.startDragging.call(this);
				}

				if (base.newRelativeX > 8 || base.newRelativeX < -8 && base.browser.isTouch === true) {
					if (event.preventDefault) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					locals.sliding = true;
				}

				if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
					$(document).off("touchmove.owl");
				}

				var minSwipe = function() {
					return  base.newRelativeX / 5;
				};
				var maxSwipe = function() {
					return  base.maximumPixels + base.newRelativeX / 5;
				};

				base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
				if (base.browser.support3d === true) {
					base.transition3d(base.newPosX);
				} else {
					base.css2move(base.newPosX);
				}
			}

			function dragEnd(e) {
				var event = e.originalEvent || e || window.event;
				event.target = event.target || event.srcElement;

				locals.dragging = false;

				if (base.browser.isTouch !== true) {
					base.$owlWrapper.removeClass("grabbing");
				}

				if (base.newRelativeX !== 0) {
					var newPosition = base.getNewPosition();
					base.goTo(newPosition, false, "drag");
					if (locals.targetElement === event.target && base.browser.isTouch !== true) {
						$(event.target).on("click.disable", function(ev) {
							ev.stopImmediatePropagation();
							ev.stopPropagation();
							ev.preventDefault();
							$(event.target).off("click.disable");
						});
						var handlers = $._data(event.target, "events").click;
						var owlStopEvent = handlers.pop();
						handlers.splice(0, 0, owlStopEvent);
					}
				}
				swapEvents("off");
			}
			base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
		};

		Carousel.prototype.getNewPosition = function() {
			var base = this,
				newPosition = base.improveClosest();

			if (newPosition>base.maximumItem) {
				base.currentItem = base.maximumItem;
				newPosition  = base.maximumItem;
			} else if (base.newPosX >=0) {
				newPosition = 0;
				base.currentItem = 0;
			}
			return newPosition;
		};

		Carousel.prototype.improveClosest = function() {
			var base = this;
			var array = base.positionsInArray;
			var goal = base.newPosX;
			var closest = null;
			$.each(array, function(i, v) {
				if (goal - (base.itemWidth/20) > array[i+1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
					closest = v;
					base.currentItem = i;
				}
				else if (goal + (base.itemWidth/20) < v && goal + (base.itemWidth / 20) > array[i + 1] && base.moveDirection() === "right") {
					closest = array[i + 1];
					base.currentItem = i + 1;
				}
			});
			return base.currentItem;
		};

		Carousel.prototype.moveDirection = function() {
			var base = this,
				direction;
			if (base.newRelativeX < 0) {
				direction = "right";
				base.playDirection = "next";
			} else {
				direction = "left";
				base.playDirection = "prev";
			}
			return direction;
		};

		Carousel.prototype.customEvents = function() {
			var base = this;
			base.$elem.on("owl.next", function() {
				base.next();
			});
			base.$elem.on("owl.prev", function() {
				base.prev();
			});
			base.$elem.on("owl.play", function(event, speed) {
				base.options.autoPlay = speed;
				base.play();
				base.hoverStatus = "play";
			});
			base.$elem.on("owl.stop", function() {
				base.stop();
				base.hoverStatus = "stop";
			});
			base.$elem.on("owl.goTo", function(event, item) {
				base.goTo(item);
			});
			base.$elem.on("owl.jumpTo", function(event, item) {
				base.jumpTo(item);
			});
		};

		Carousel.prototype.stopOnHover = function() {
			var base = this;
			if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
				base.$elem.on("mouseover", function() {
					base.stop();
				});
				base.$elem.on("mouseout", function() {
					if (base.hoverStatus !== "stop") {
						base.play();
					}
				});
			}
		};

		Carousel.prototype.lazyLoad = function() {
			var base = this;

			if (base.options.lazyLoad === false) {
				return false;
			}
			for (var i=0; i<base.itemsAmount; i++) {
				var $item = $(base.$owlItems[i]);

				if ($item.data("owl-loaded") === "loaded") {
					continue;
				}

				var	itemNumber = $item.data("owl-item"),
					$lazyImg = $item.find(".lazyOwl"),
					follow;

				if (typeof $lazyImg.data("src") !== "string") {
					$item.data("owl-loaded", "loaded");
					continue;
				}
				if ($item.data("owl-loaded") === undefined) {
					$lazyImg.hide();
					$item.addClass("loading").data("owl-loaded", "checked");
				}
				if (base.options.lazyFollow === true) {
					follow = itemNumber >= base.currentItem;
				} else {
					follow = true;
				}
				if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
					base.lazyPreload($item, $lazyImg);
				}
			}
		};

		Carousel.prototype.lazyPreload = function($item, $lazyImg) {
			var base = this,
				iterations = 0;
				$lazyImg[0].src = $lazyImg.data("src");
				checkLazyImage();

			function checkLazyImage() {
				iterations += 1;
				if (base.completeImg($lazyImg.get(0))) {
					showImage();
				} else if (iterations <= 100) {//if image loads in less than 10 seconds
					setTimeout(checkLazyImage, 100);
				} else {
					showImage();
				}
			}
			function showImage() {
				$item.data("owl-loaded", "loaded").removeClass("loading");
				$lazyImg.removeAttr("data-src");
				if (base.options.lazyEffect === "fade") {
					$lazyImg.fadeIn(400);
				} else {
					$lazyImg.show();
				}
			}
		};

		Carousel.prototype.autoHeight = function() {
			var base = this;
			var $currentimg = $(base.$owlItems[base.currentItem]).find("img");

			if ($currentimg.get(0) !== undefined) {
				var iterations = 0;
				checkImage();
			} else {
				addHeight();
			}
			function checkImage() {
				iterations += 1;
				if (base.completeImg($currentimg.get(0))) {
					addHeight();
				} else if (iterations <= 100) { //if image loads in less than 10 seconds
					setTimeout(checkImage, 100);
				} else {
					base.wrapperOuter.css("height", ""); //Else remove height attribute
				}
			}

			function addHeight() {
				var $currentItem = $(base.$owlItems[base.currentItem]).height();
				base.wrapperOuter.css("height", $currentItem + "px");
				if (!base.wrapperOuter.hasClass("autoHeight")) {
					setTimeout(function() {
						base.wrapperOuter.addClass("autoHeight");
					}, 0);
				}
			}
		};

		Carousel.prototype.completeImg = function(img) {
			if (!img.complete) {
				return false;
			}
			if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
				return false;
			}
			return true;
		};

		Carousel.prototype.addClassActive = function() {
			var base = this;
			base.$owlItems.removeClass("active");
			for (var i=base.currentItem; i < base.currentItem + base.options.items; i++) {
				$(base.$owlItems[i]).addClass("active");
			}
		};

		Carousel.prototype.transitionTypes = function(className) {
			var base = this;
			//Currently available: "fade", "backSlide", "goDown", "fadeUp"
			base.outClass = "owl-" + className + "-out";
			base.inClass = "owl-" + className + "-in";
		};

		Carousel.prototype.singleItemTransition = function() {
			var base = this;
			base.isTransition = true;

			var outClass = base.outClass,
				inClass = base.inClass,
				$currentItem = base.$owlItems.eq(base.currentItem),
				$prevItem = base.$owlItems.eq(base.prevItem),
				prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
				origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2;

			base.$owlWrapper
				.addClass('owl-origin')
				.css({
					"-webkit-transform-origin": origin + "px",
					"-moz-perspective-origin": origin + "px",
					"perspective-origin": origin + "px"
				});
			function transStyles(prevPos, zindex) {
				return {
					position: "relative",
					left: prevPos + "px"
				};
			}

			var animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

			$prevItem
			.css(transStyles(prevPos, 10))
			.addClass(outClass)
			.on(animEnd, function() {
				base.endPrev = true;
				$prevItem.off(animEnd);
				base.clearTransStyle($prevItem, outClass);
			});

			$currentItem
			.addClass(inClass)
			.on(animEnd, function() {
				base.endCurrent = true;
				$currentItem.off(animEnd);
				base.clearTransStyle($currentItem, inClass);
			});
		};

		Carousel.prototype.clearTransStyle = function(item, classToRemove) {
			var base = this;
			item.css({
					position: "",
					left: ""
				})
				.removeClass(classToRemove);
			if (base.endPrev && base.endCurrent) {
				base.$owlWrapper.removeClass('owl-origin');
				base.endPrev = false;
				base.endCurrent = false;
				base.isTransition = false;
			}
		};

		Carousel.prototype.owlStatus = function() {
			var base = this;
			base.owl = {
				userOptions: base.userOptions,
				baseElement: base.$elem,
				userItems: base.$userItems,
				owlItems: base.$owlItems,
				currentItem: base.currentItem,
				prevItem: base.prevItem,
				isTouch: base.browser.isTouch,
				browser: base.browser
			};
		};

		Carousel.prototype.clearEvents = function() {
			var base = this;
			base.$elem.off(".owl owl mousedown.disableTextSelect");
			$(document).off(".owl owl");
			$(window).off("resize", base.resizer);
		};

		Carousel.prototype.unWrap = function() {
			var base = this;
			if (base.$elem.children().length !== 0) {
				base.$owlWrapper.unwrap();
				base.$userItems.unwrap().unwrap();
				if (base.owlControls) {
					base.owlControls.remove();
				}
			}
			base.clearEvents();
			base.$elem
				.attr("style", base.$elem.data("owl-originalStyles") || "")
				.attr("class", base.$elem.data("owl-originalClasses"));
		};

		Carousel.prototype.destroy = function() {
			var base = this;
			base.stop();
			clearInterval(base.checkVisible);
			base.unWrap();
			base.$elem.removeData();
		};

		Carousel.prototype.reinit = function(newOptions) {
			var base = this;
			var options = $.extend({}, base.userOptions, newOptions);
			base.unWrap();
			base.init(options, base.$elem);
		};

		Carousel.prototype.addItem = function(htmlString, targetPosition) {
			var base = this,
				position;

			if (!htmlString) {
				return false;
			}

			if (base.$elem.children().length === 0) {
				base.$elem.append(htmlString);
				base.setVars();
				return false;
			}
			base.unWrap();
			if (targetPosition === undefined || targetPosition === -1) {
				position = -1;
			} else {
				position = targetPosition;
			}
			if (position >= base.$userItems.length || position === -1) {
				base.$userItems.eq(-1).after(htmlString);
			} else {
				base.$userItems.eq(position).before(htmlString);
			}

			base.setVars();
		};

		Carousel.prototype.removeItem = function(targetPosition) {
			var base = this,
				position;

			if (base.$elem.children().length === 0) {
				return false;
			}

			if (targetPosition === undefined || targetPosition === -1) {
				position = -1;
			} else {
				position = targetPosition;
			}

			base.unWrap();
			base.$userItems.eq(position).remove();
			base.setVars();
		};

		return Carousel;
	})();

	$.fn.owlCarousel = function(options) {
		return this.each(function() {
			if ($(this).data("owl-init") === true) {
				return false;
			}
			$(this).data("owl-init", true);
			var carousel = new Carousel(options, this);
			$.data(this, "owlCarousel", carousel);
		});
	};

	$.fn.owlCarousel.options = {

		items: 5,
		itemsDesktop: [1199, 4],
		itemsDesktopSmall: [979, 3],
		itemsTablet: [768, 2],
		itemsTabletSmall: false,
		itemsMobile: [479, 1],
		singleItem: false,
		itemsScaleUp: false,

		slideSpeed: 200,
		paginationSpeed: 800,
		rewindSpeed: 1000,

		autoPlay: false,
		stopOnHover: false,

		navigation: false,
		navigationText: ["prev", "next"],
		rewindNav: true,
		scrollPerPage: false,

		pagination: true,
		paginationNumbers: false,

		responsive: true,
		responsiveRefreshRate: 200,
		responsiveBaseWidth: window,

		baseClass: "owl-carousel",
		theme: "owl-theme",

		lazyLoad: false,
		lazyFollow: true,
		lazyEffect: "fade",

		autoHeight: false,

		jsonPath: false,
		jsonSuccess: false,

		dragBeforeAnimFinish: true,
		mouseDrag: true,
		touchDrag: true,

		addClassActive: false,
		transitionStyle: false,

		beforeUpdate: false,
		afterUpdate: false,
		beforeInit: false,
		afterInit: false,
		beforeMove: false,
		afterMove: false,
		afterAction: false,
		startDragging: false

	};
})(jQuery);
