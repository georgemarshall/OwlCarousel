/*!
 *	jQuery OwlCarousel v1.28
 *
 *	Copyright (c) 2013 Bartosz Wojciechowski
 *	http://www.owlgraphic.com/owlcarousel/
 *
 *	Licensed under MIT
 *
 */
"use strict";
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

		Carousel.prototype.logIn = function() {
			this.$elem.css({opacity: 0});
			this.orignalItems = this.options.items;
			this.checkBrowser();
			this.wrapperWidth = 0;
			// this.checkVisible;
			this.setVars();
		};

		Carousel.prototype.setVars = function() {
			this.$userItems = this.$elem.children();
			this.itemsAmount = this.$userItems.length;

			if (this.itemsAmount === 0) {
				return false;
			}

			this.baseClass();
			this.eventTypes();
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

		Carousel.prototype.reload = function() {
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
			var base = this;
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
			this.positionsInArray = [0];
			var elWidth = 0;

			for (var i=0; i < this.itemsAmount; i++) {
				elWidth += this.itemWidth;
				this.positionsInArray.push(-elWidth);
			}
		};

		Carousel.prototype.buildControls = function() {
			if (this.options.navigation === true || this.options.pagination === true) {
				this.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !this.browser.isTouch).appendTo(this.$elem);
			}
			if (this.options.pagination === true) {
				this.buildPagination();
			}
			if (this.options.navigation === true) {
				this.buildButtons();
			}
		};

		Carousel.prototype.buildButtons = function() {
			var base = this;
			var buttonsWrapper = $("<div class=\"owl-buttons\"/>");
			this.owlControls.append(buttonsWrapper);

			this.buttonPrev = $("<div/>", {
				"class": "owl-prev",
				"html": this.options.navigationText[0] || ""
			});

			this.buttonNext = $("<div/>", {
				"class": "owl-next",
				"html": this.options.navigationText[1] || ""
			});

			buttonsWrapper
			.append(this.buttonPrev)
			.append(this.buttonNext);

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

			this.paginationWrapper = $("<div class=\"owl-pagination\"/>");
			this.owlControls.append(this.paginationWrapper);

			this.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function(event) {
				event.preventDefault();
				if (Number($(this).data("owl-page")) !== base.currentItem) {
					base.goTo(Number($(this).data("owl-page")), true);
				}
			});
		};

		Carousel.prototype.updatePagination = function() {
			if (this.options.pagination === false) {
				return false;
			}

			this.paginationWrapper.html("");

			var attributes = function() {return {};},
				pages = Math.ceil(this.itemsAmount / this.options.items);

			// Change our attributes function based upon settings
			if (this.options.paginationNumbers === true) {
				attributes = function(index) {
					return {
						"text": index + 1,
						"class": "owl-numbers"
					};
				};
			}
			if (this.options.paginationTitles === true && this.options.singleItem === true) {
				var titleList = [];

				// Grab all the titles
				this.$userItems.each(function() {
					var title = $(this).data("title");
					titleList.push(title || "");
				});

				attributes = function(index) {
					return {
						"text": titleList[index],
						"class": "owl-titles"
					};
				};
			}

			for (var i=0; i < pages; i++) {
				var paginationButton = $("<div/>", {
					"class": "owl-page"
				});
				var paginationButtonInner = $("<span></span>", attributes.call(this, i));
				paginationButton.append(paginationButtonInner);

				paginationButton.data("owl-page", i * this.options.items);
				paginationButton.data("owl-roundPages", i + 1);

				this.paginationWrapper.append(paginationButton);
			}
			this.checkPagination();
		};

		Carousel.prototype.checkPagination = function() {
			var base = this;
			if (this.options.pagination === false) {
				return false;
			}
			this.paginationWrapper.find(".owl-page").each(function() {
				if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
					base.paginationWrapper
						.find(".owl-page")
						.removeClass("active");
					$(this).addClass("active");
				}
			});
		};

		Carousel.prototype.checkNavigation = function() {
			if (this.options.navigation === false) {
				return false;
			}
			if (this.options.rewindNav === false) {
				if (this.currentItem === 0 && this.maximumItem === 0) {
					this.buttonPrev.addClass("disabled");
					this.buttonNext.addClass("disabled");
				} else if (this.currentItem === 0 && this.maximumItem !== 0) {
					this.buttonPrev.addClass("disabled");
					this.buttonNext.removeClass("disabled");
				} else if (this.currentItem === this.maximumItem) {
					this.buttonPrev.removeClass("disabled");
					this.buttonNext.addClass("disabled");
				} else if (this.currentItem !== 0 && this.currentItem !== this.maximumItem) {
					this.buttonPrev.removeClass("disabled");
					this.buttonNext.removeClass("disabled");
				}
			}
		};

		Carousel.prototype.updateControls = function() {
			this.updatePagination();
			this.checkNavigation();
			if (this.owlControls) {
				if (this.options.items >= this.itemsAmount) {
					this.owlControls.hide();
				} else {
					this.owlControls.show();
				}
			}
		};

		Carousel.prototype.destroyControls = function() {
			if (this.owlControls) {
				this.owlControls.remove();
			}
		};

		Carousel.prototype.next = function(speed) {
			if (this.isTransition) {
				return false;
			}

			this.storePrevItem = this.currentItem;

			this.currentItem += this.options.scrollPerPage === true ? this.options.items : 1;
			if (this.currentItem > this.maximumItem + (this.options.scrollPerPage === true ? (this.options.items - 1) : 0)) {
				if (this.options.rewindNav === true) {
					this.currentItem = 0;
					speed = "rewind";
				} else {
					this.currentItem = this.maximumItem;
					return false;
				}
			}
			this.goTo(this.currentItem, speed);
		};

		Carousel.prototype.prev = function(speed) {
			if (this.isTransition) {
				return false;
			}

			this.storePrevItem = this.currentItem;

			if (this.options.scrollPerPage === true && this.currentItem > 0 && this.currentItem < this.options.items) {
				this.currentItem = 0;
			} else {
				this.currentItem -= this.options.scrollPerPage === true ? this.options.items : 1;
			}
			if (this.currentItem < 0) {
				if (this.options.rewindNav === true) {
					this.currentItem = this.maximumItem;
					speed = "rewind";
				} else {
					this.currentItem = 0;
					return false;
				}
			}
			this.goTo(this.currentItem, speed);
		};

		Carousel.prototype.goTo = function(position, speed, drag) {
			var base = this;

			if (this.isTransition) {
				return false;
			}
			this.getPrevItem();
			if (typeof this.options.beforeMove === "function") {
				this.options.beforeMove.call(this, this.$elem);
			}
			if (position >= this.maximumItem) {
				position = this.maximumItem;
			}
			else if (position <= 0) {
				position = 0;
			}

			this.currentItem = this.owl.currentItem = position;
			if (this.options.transitionStyle !== false && drag !== "drag" && this.options.items === 1 && this.browser.support3d === true) {
				this.swapSpeed(0);
				if (this.browser.support3d === true) {
					this.transition3d(this.positionsInArray[position]);
				} else {
					this.css2slide(this.positionsInArray[position], 1);
				}
				this.singleItemTransition();
				this.afterGo();
				return false;
			}
			var goToPixel = this.positionsInArray[position];

			if (this.browser.support3d === true) {
				this.isCss3Finish = false;

				if (speed === true) {
					this.swapSpeed("paginationSpeed");
					setTimeout(function() {
						base.isCss3Finish = true;
					}, this.options.paginationSpeed);
				} else if (speed === "rewind") {
					this.swapSpeed(this.options.rewindSpeed);
					setTimeout(function() {
						base.isCss3Finish = true;
					}, this.options.rewindSpeed);
				} else {
					this.swapSpeed("slideSpeed");
					setTimeout(function() {
						base.isCss3Finish = true;
					}, this.options.slideSpeed);
				}
				this.transition3d(goToPixel);
			} else {
				if (speed === true) {
					this.css2slide(goToPixel, this.options.paginationSpeed);
				} else if (speed === "rewind") {
					this.css2slide(goToPixel, this.options.rewindSpeed);
				} else {
					this.css2slide(goToPixel, this.options.slideSpeed);
				}
			}
			this.afterGo();
		};

		Carousel.prototype.getPrevItem = function() {
			this.prevItem = this.owl.prevItem = this.storePrevItem === undefined ? this.currentItem : this.storePrevItem;
			this.storePrevItem = undefined;
		};

		Carousel.prototype.jumpTo = function(position) {
			this.getPrevItem();
			if (typeof this.options.beforeMove === "function") {
				this.options.beforeMove.call(this, this.$elem);
			}
			if (position >= this.maximumItem || position === -1) {
				position = this.maximumItem;
			}
			else if (position <= 0) {
				position = 0;
			}
			this.swapSpeed(0);
			if (this.browser.support3d === true) {
				this.transition3d(this.positionsInArray[position]);
			} else {
				this.css2slide(this.positionsInArray[position], 1);
			}
			this.currentItem = this.owl.currentItem = position;
			this.afterGo();
		};

		Carousel.prototype.afterGo = function() {
			this.checkPagination();
			this.checkNavigation();
			this.eachMoveUpdate();

			if (typeof this.options.afterMove === "function") {
				this.options.afterMove.call(this, this.$elem);
			}
			if (this.options.autoPlay !== false) {
				this.checkAp();
			}
		};

		Carousel.prototype.stop = function() {
			this.apStatus = "stop";
			clearInterval(this.autoPlayInterval);
		};

		Carousel.prototype.checkAp = function() {
			if (this.apStatus !== "stop") {
				this.play();
			}
		};

		Carousel.prototype.play = function() {
			var base = this;
			this.apStatus = "play";
			if (this.options.autoPlay === false) {
				return false;
			}
			clearInterval(this.autoPlayInterval);
			this.autoPlayInterval = setInterval(function() {
				base.next(true);
			}, this.options.autoPlay);
		};

		Carousel.prototype.swapSpeed = function(action) {
			if (action === "slideSpeed") {
				this.$owlWrapper.css(this.addCssSpeed(this.options.slideSpeed));
			} else if (action === "paginationSpeed") {
				this.$owlWrapper.css(this.addCssSpeed(this.options.paginationSpeed));
			} else if (typeof action !== "string") {
				this.$owlWrapper.css(this.addCssSpeed(action));
			}
		};

		Carousel.prototype.addCssSpeed = function(speed) {
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
			this.$owlWrapper.css(this.doTranslate(value));
		};

		Carousel.prototype.css2move = function(value) {
			this.$owlWrapper.css({left: value});
		};

		Carousel.prototype.css2slide = function(value, speed) {
			var base = this;

			this.isCssFinish = false;
			this.$owlWrapper.stop(true, true).animate({
				left: value
			}, {
				duration: speed || this.options.slideSpeed,
				complete: function() {
					base.isCssFinish = true;
				}
			});
		};

		Carousel.prototype.checkBrowser = function() {
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

			this.browser = {
				support3d: support3d,
				isTouch: isTouch
			};
		};

		Carousel.prototype.moveEvents = function() {
			if (this.options.mouseDrag !== false || this.options.touchDrag !== false) {
				this.gestures();
				this.disabledEvents();
			}
		};

		Carousel.prototype.eventTypes = function() {
			if (this.options.mouseDrag === true && this.options.touchDrag === true) {
				this.ev_types = {
					start: "touchstart.owl mousedown.owl",
					move: "touchmove.owl mousemove.owl",
					end: "touchend.owl touchcancel.owl mouseup.owl"
				};
			} else if (this.options.mouseDrag === false && this.options.touchDrag === true) {
				this.ev_types = {
					start: "touchstart.owl",
					move: "touchmove.owl",
					end: "touchend.owl touchcancel.owl"
				};
			} else if (this.options.mouseDrag === true && this.options.touchDrag === false) {
				this.ev_types = {
					start: "mousedown.owl",
					move: "mousemove.owl",
					end: "mouseup.owl"
				};
			} else {
				this.ev_types = {
					start: "s",
					move: "e",
					end: "x"
				};
			}
		};

		Carousel.prototype.disabledEvents = function() {
			this.$elem.on("dragstart.owl", function(event) {
				event.preventDefault();
			});
			this.$elem.on("mousedown.disableTextSelect", function(e) {
				return $(e.target).is("input, textarea, select, option");
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

			this.isCssFinish = true;

			function swapEvents(type) {
				if (type === "on") {
					$(document).on(base.ev_types.move, dragMove);
					$(document).on(base.ev_types.end, dragEnd);
				} else if (type === "off") {
					$(document).off(base.ev_types.move);
					$(document).off(base.ev_types.end);
				}
			}

			function dragStart(event) { /* jshint validthis: true */
				var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event;

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

				locals.offsetX = data.pageX - position.left;
				locals.offsetY = data.pageY - position.top;

				swapEvents("on");

				locals.sliding = false;
				locals.targetElement = event.target;
			}

			function dragMove(event) { /* jshint validthis: true */
				var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event;

				base.newPosX = data.pageX - locals.offsetX;
				base.newPosY = data.pageY - locals.offsetY;
				base.newRelativeX = base.newPosX - locals.relativePos;

				if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
					locals.dragging = true;
					base.options.startDragging.call(this);
				}

				if (base.newRelativeX > 8 || base.newRelativeX < -8 && base.browser.isTouch === true) {
					event.preventDefault();
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

			function dragEnd(event) {
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
					}
				}
				swapEvents("off");
			}
			this.$elem.on(this.ev_types.start, ".owl-wrapper", dragStart);
		};

		Carousel.prototype.getNewPosition = function() {
			var newPosition = this.improveClosest();

			if (newPosition>this.maximumItem) {
				this.currentItem = this.maximumItem;
				newPosition  = this.maximumItem;
			} else if (this.newPosX >=0) {
				newPosition = 0;
				this.currentItem = 0;
			}
			return newPosition;
		};

		Carousel.prototype.improveClosest = function() {
			var base = this;
			var array = this.positionsInArray;
			var goal = this.newPosX;
			var closest = null;
			$.each(array, function(i, v) {
				if (goal - (base.itemWidth/20) > array[i+1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
					closest = v;
					base.currentItem = i;
				}
				else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > array[i + 1] && base.moveDirection() === "right") {
					closest = array[i + 1];
					base.currentItem = i + 1;
				}
			});
			return this.currentItem;
		};

		Carousel.prototype.moveDirection = function() {
			var direction;
			if (this.newRelativeX < 0) {
				direction = "right";
				this.playDirection = "next";
			} else {
				direction = "left";
				this.playDirection = "prev";
			}
			return direction;
		};

		Carousel.prototype.customEvents = function() {
			var base = this;
			this.$elem.on("owl.next", function() {
				base.next();
			});
			this.$elem.on("owl.prev", function() {
				base.prev();
			});
			this.$elem.on("owl.play", function(event, speed) {
				base.options.autoPlay = speed;
				base.play();
				base.hoverStatus = "play";
			});
			this.$elem.on("owl.stop", function() {
				base.stop();
				base.hoverStatus = "stop";
			});
			this.$elem.on("owl.goTo", function(event, item) {
				base.goTo(item);
			});
			this.$elem.on("owl.jumpTo", function(event, item) {
				base.jumpTo(item);
			});
		};

		Carousel.prototype.stopOnHover = function() {
			var base = this;
			if (this.options.stopOnHover === true && this.browser.isTouch !== true && this.options.autoPlay !== false) {
				this.$elem.on("mouseover", function() {
					base.stop();
				});
				this.$elem.on("mouseout", function() {
					if (base.hoverStatus !== "stop") {
						base.play();
					}
				});
			}
		};

		Carousel.prototype.lazyLoad = function() {
			if (this.options.lazyLoad === false) {
				return false;
			}
			for (var i=0; i < this.itemsAmount; i++) {
				var $item = $(this.$owlItems[i]);

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
				if (this.options.lazyFollow === true) {
					follow = itemNumber >= this.currentItem;
				} else {
					follow = true;
				}
				if (follow && itemNumber < this.currentItem + this.options.items && $lazyImg.length) {
					this.lazyPreload($item, $lazyImg);
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
			var $currentimg = $(this.$owlItems[this.currentItem]).find("img");

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
			this.$owlItems.removeClass("active");
			for (var i=this.currentItem; i < this.currentItem + this.options.items; i++) {
				$(this.$owlItems[i]).addClass("active");
			}
		};

		Carousel.prototype.transitionTypes = function(className) {
			//Currently available: "fade", "backSlide", "goDown", "fadeUp"
			this.outClass = "owl-" + className + "-out";
			this.inClass = "owl-" + className + "-in";
		};

		Carousel.prototype.singleItemTransition = function() {
			var base = this;
			this.isTransition = true;

			var outClass = this.outClass,
				inClass = this.inClass,
				$currentItem = this.$owlItems.eq(this.currentItem),
				$prevItem = this.$owlItems.eq(this.prevItem),
				prevPos = Math.abs(this.positionsInArray[this.currentItem]) + this.positionsInArray[this.prevItem],
				origin = Math.abs(this.positionsInArray[this.currentItem]) + this.itemWidth / 2;

			this.$owlWrapper
				.addClass("owl-origin")
				.css({
					"-webkit-transform-origin": origin + "px",
					"-moz-perspective-origin": origin + "px",
					"perspective-origin": origin + "px"
				});

			function transStyles(prevPos) {
				return {
					position: "relative",
					left: prevPos + "px"
				};
			}

			var animEnd = "webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend";

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
			item.css({
					position: "",
					left: ""
				})
				.removeClass(classToRemove);
			if (this.endPrev && this.endCurrent) {
				this.$owlWrapper.removeClass("owl-origin");
				this.endPrev = false;
				this.endCurrent = false;
				this.isTransition = false;
			}
		};

		Carousel.prototype.owlStatus = function() {
			this.owl = {
				userOptions: this.userOptions,
				thisElement: this.$elem,
				userItems: this.$userItems,
				owlItems: this.$owlItems,
				currentItem: this.currentItem,
				prevItem: this.prevItem,
				isTouch: this.browser.isTouch,
				browser: this.browser
			};
		};

		Carousel.prototype.clearEvents = function() {
			this.$elem.off(".owl owl mousedown.disableTextSelect");
			$(document).off(".owl owl");
			$(window).off("resize", this.resizer);
		};

		Carousel.prototype.unWrap = function() {
			if (this.$elem.children().length !== 0) {
				this.$owlWrapper.unwrap();
				this.$userItems.unwrap().unwrap();
				if (this.owlControls) {
					this.owlControls.remove();
				}
			}
			this.clearEvents();
			this.$elem
				.attr("style", this.$elem.data("owl-originalStyles") || "")
				.attr("class", this.$elem.data("owl-originalClasses"));
		};

		Carousel.prototype.destroy = function() {
			this.stop();
			clearInterval(this.checkVisible);
			this.unWrap();
			this.$elem.removeData();
		};

		Carousel.prototype.reinit = function(newOptions) {
			var options = $.extend({}, this.userOptions, newOptions);
			this.unWrap();
			this.init(options, this.$elem);
		};

		Carousel.prototype.addItem = function(htmlString, targetPosition) {
			var position;

			if (!htmlString) {
				return false;
			}

			if (this.$elem.children().length === 0) {
				this.$elem.append(htmlString);
				this.setVars();
				return false;
			}
			this.unWrap();
			if (targetPosition === undefined || targetPosition === -1) {
				position = -1;
			} else {
				position = targetPosition;
			}
			if (position >= this.$userItems.length || position === -1) {
				this.$userItems.eq(-1).after(htmlString);
			} else {
				this.$userItems.eq(position).before(htmlString);
			}

			this.setVars();
		};

		Carousel.prototype.removeItem = function(targetPosition) {
			var position;

			if (this.$elem.children().length === 0) {
				return false;
			}

			if (targetPosition === undefined || targetPosition === -1) {
				position = -1;
			} else {
				position = targetPosition;
			}

			this.unWrap();
			this.$userItems.eq(position).remove();
			this.setVars();
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
		paginationTitles: false,

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
