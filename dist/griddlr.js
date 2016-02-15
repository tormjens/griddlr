(function($, window, document) {
  var Griddlr, defaults, pluginName;
  pluginName = "Griddlr";
  defaults = {
    debug: false,
    property: "value",
    columns: 12,
    classes: {
      row: "row",
      column: "col-xs-*"
    }
  };
  Griddlr = (function() {
    function Griddlr(element1, options) {
      this.element = element1;
      this.$element = $(this.element);
      this.settings = $.extend({}, defaults, options);
      this._gutter = 15;
      this._defaults = defaults;
      this._name = pluginName;
      this.init();
    }

    Griddlr.prototype.log = function(message) {
      if (this.settings.debug) {
        return console.log('% Griddlr: ' + message);
      }
    };

    Griddlr.prototype.trigger = function(name, value) {
      value = !!value || '';
      name = 'griddlr.' + name;
      return this.$element.trigger(name, [this, value]);
    };

    Griddlr.prototype.set = function(key, value) {
      return this.settings[key] = value;
    };

    Griddlr.prototype.init = function() {
      var self;
      self = this;
      return $(document).ready(function() {
        self.trigger('init.before');
        self.log('Initializing...');
        self.createWrapper();
        self.setupRows();
        self.setupColumns();
        self.bindResize();
        return self.trigger('init.after');
      });
    };

    Griddlr.prototype.createWrapper = function() {
      this.log('Creating wrapper element...');
      this.$element.wrapInner('<div class="griddlr-wrapper"></div>');
      this.wrapper = this.$element.find('.griddlr-wrapper');
      if (this.settings.debug) {
        this.wrapper.addClass('griddlr-debug');
      }
      this.wrapper.wrapInner('<div class="griddlr-content"></div>');
      this.content = this.wrapper.find('.griddlr-content');
      return this.createDataElement();
    };

    Griddlr.prototype.createDataElement = function() {
      this.log('Creating data element...');
      this.dataElement = $('<div class="griddlr-data"></div>').appendTo(this.wrapper);
      this.dataRow = $('<div></div>').addClass(this.settings.classes.row);
      this.dataColumn = $('<div></div>').addClass(this.columnClass(this.settings.columns));
      this.dataColumn.appendTo(this.dataRow);
      this.dataRow.appendTo(this.dataElement);
      return this.collectData();
    };

    Griddlr.prototype.addRow = function(row) {
      row.addClass('griddlr-row');
      row.append('<div class="griddlr-button griddlr-button-add">+</div>');
      row.append('<div class="griddlr-button griddlr-button-remove">&times;</div>');
      return row.wrapInner('<div class="griddlr-row-inner"></div>');
    };

    Griddlr.prototype.setupRows = function() {
      var self;
      self = this;
      return this.content.find('.' + this.settings.classes.row).each(function() {
        return self.addRow($(this));
      });
    };

    Griddlr.prototype.getColumns = function(element) {
      var className, classPrefix;
      className = element.className.replace('griddlr-column', '').trim();
      classPrefix = this.settings.classes.column.replace('*', '');
      return parseInt(className.replace(classPrefix, ''));
    };

    Griddlr.prototype.drag = function(element) {
      var click, columns, drag, offset, target;
      click = 0;
      drag = 0;
      offset = 0;
      target = element;
      columns = this.getColumns(element);
      $(document).on('mousedown', function(e) {
        if (e.target === element) {
          target = e.target;
          click = 1;
          offset = e.offsetX;
          return $('html').css('cursor', 'ew-resize');
        }
      });
      $(document).on('mousemove', function(e) {
        if (click) {
          if (offset > e.offsetX) {
            return console.log(columns);
          }
        }
      });
      return $(document).on('mouseup', function(e) {
        click = 0;
        drag = 0;
        return $('html').css('cursor', '');
      });
    };

    Griddlr.prototype.addColumn = function(column) {
      column.addClass('griddlr-column');
      column.append('<div class="griddlr-button griddlr-button-remove">&times;</div>');
      return column.wrapInner('<div class="griddlr-column-inner"></div>');
    };

    Griddlr.prototype.bindColumn = function(column) {
      var edge;
      edge = column.innerWidth() - (this._gutter * 2);
      this.drag(column.get(0));
      column.on('mousemove', function(e) {
        if (e.offsetX >= edge) {
          return $('html').css('cursor', 'ew-resize');
        } else {
          return $('html').css('cursor', '');
        }
      });
      return column.on('mouseleave', function(e) {});
    };

    Griddlr.prototype.setupColumns = function() {
      var self;
      self = this;
      return this.content.find('[class^="' + this.columnClass('' + '"]')).each(function() {
        self.addColumn($(this));
        return self.bindColumn($(this));
      });
    };

    Griddlr.prototype.bindResize = function() {};

    Griddlr.prototype.collectData = function() {
      this.log('Collecting data...');
      return this._gutter = parseInt(this.dataColumn.css('padding-left'));
    };

    Griddlr.prototype.columnClass = function(columns) {
      return this.settings.classes.column.replace('*', columns);
    };

    return Griddlr;

  })();
  return $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, "" + pluginName)) {
        return $.data(this, "" + pluginName, new Griddlr(this, options));
      }
    });
  };
})(jQuery, window, document);
