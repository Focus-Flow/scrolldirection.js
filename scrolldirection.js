/*!
 * scrolldirection.js
 * https://github.com/Focus-Flow/scrolldirection.js
 *
 * A javascript library to detect scroll direction.
 *
 * @version 1.0.0
 * @date    2015-02-06
 *
 * @license
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Focus Flow Oy
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * 
 */
(function($) {
  "use strict";

  var ScrollDirection = function(options) {
    this._options = _.extend({}, this.defaults, options);
    this._direction = ScrollDirection.prototype.directions.static;
    this._window = $(window);
    this._windowScrollTop = this._window.scrollTop();
    this._scrollStarted = this._windowScrollTop;
    this._window.on('touchstart', _.bind(this._touchStart, this));
    this._window.on('touchmove', _.bind(this._touchMove, this));
    this._window.on('touchend touchcancel touchleave', _.bind(this._touchEnd, this));
    this._window.scroll(_.bind(this._listener, this));
    this._listener();
  };

  ScrollDirection.prototype = {
    _options: {},
    _methods: [],
    _scrollStarted: 0,
    _difference: 0,
    _direction: undefined,
    _window: null,
    _windowScrollTop: 0,
    _timer: null,
    _touch: null,

    _clearTimer: function() {
      if (this._timer !== null) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    },

    _decide: function() {
      if (Math.abs(this._difference) > this._options.offset) {
        if (this._difference < 0) {
          this._direction = this.directions.up;
        } else if (this._difference > 0) {
          this._direction = this.directions.down;
        }
        this._run();
      }
      if (this._windowScrollTop === 0 && this._direction === this.directions.down) {
        this._direction = this.directions.up;
        this._run();
      }
      this._clearTimer();
      this._timer = setTimeout(_.bind(this._clearTimer, this), this._options.timeout);
    },

    _listener: function() {
      if (this._touch !== null) {
        return;
      }
      this._windowScrollTop = this._window.scrollTop();
      if (this._timer === null) {
        this._scrollStarted = this._windowScrollTop;
      }
      this._difference = this._windowScrollTop - this._scrollStarted;
      this._decide();
    },

    _touchStart: function(event) {
      this._touch = event.originalEvent.changedTouches[0];
      if (this._timer === null && this._touch) {
        this._scrollStarted = this._touch.clientY;
      }
    },

    _touchMove: function(event) {
      var that = this;
      this._touch = _.filter(event.originalEvent.changedTouches, function(touch) {
        return that._touch !== null && touch.identifier === that._touch.identifier && touch.pageY === that._touch.pageY;
      })[0];
      if (this._touch === undefined) {
        this._touch = null;
      }
      if (this._touch) {
        this._difference = this._scrollStarted - this._touch.clientY;
        this._decide();
      }
    },

    _touchEnd: function(event) {
      this._touch = null;
      this._clearTimer();
    },

    _run: function() {
      var direction = this._direction;
      _.each(this._methods, function(element, index, list) {
        element(direction);
      });
    },

    directions: {
      up: -1,
      static: 0,
      down: 1
    },
    defaults: {
      offset: 20,
      timeout: 200
    },

    addMethod: function(method) {
      this._methods.push(method);
    }
  };

  window.scrollDirection = new ScrollDirection();
})(jQuery);
