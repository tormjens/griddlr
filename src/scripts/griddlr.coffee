do ($ = jQuery, window, document) ->

	# Create the defaults once
	pluginName = "Griddlr"
	defaults =
		debug: false
		property: "value"
		columns: 12
		classes:
			row: "row"
			column: "col-xs-*"

	# The actual plugin constructor
	class Griddlr
		constructor: (@element, options) ->
			@$element  = $(@element);
			@settings  = $.extend {}, defaults, options
			@_gutter   = 15;
			@_defaults = defaults
			@_name     = pluginName
			@init()

		# Logs stuff to the console if debugging is enabled
		log: (message) ->
			if @settings.debug
				console.log '% Griddlr: '+ message

		# Triggers an event
		trigger: (name, value) ->
			value = !!value || ''
			name  = 'griddlr.' + name
			@$element.trigger name, [@, value]

		# Modifies a setting
		set: (key, value) ->
			@settings[key] = value;

		# Init the plugin
		init: ->
			self = @
			$(document).ready ->
				self.trigger 'init.before'
				self.log 'Initializing...'
				self.createWrapper()
				self.setupRows()
				self.setupColumns()
				self.bindResize()
				self.trigger 'init.after'

		createWrapper: ->
			@log 'Creating wrapper element...'

			@$element.wrapInner '<div class="griddlr-wrapper"></div>'
			@wrapper = @$element.find '.griddlr-wrapper'

			if @settings.debug
				@wrapper.addClass 'griddlr-debug'

			@wrapper.wrapInner '<div class="griddlr-content"></div>'
			@content = @wrapper.find '.griddlr-content'

			@createDataElement()

		createDataElement: ->
			@log 'Creating data element...'
			@dataElement = $('<div class="griddlr-data"></div>').appendTo @wrapper

			@dataRow = $('<div></div>').addClass @settings.classes.row

			@dataColumn = $('<div></div>').addClass @columnClass @settings.columns
			@dataColumn.appendTo @dataRow

			@dataRow.appendTo @dataElement

			@collectData()

		addRow: (row) ->
			row.addClass 'griddlr-row'
			row.append '<div class="griddlr-button griddlr-button-add">+</div>'
			row.append '<div class="griddlr-button griddlr-button-remove">&times;</div>'
			row.wrapInner '<div class="griddlr-row-inner"></div>'

		setupRows: ->
			self = @
			@content.find('.'+ @settings.classes.row).each ->
				self.addRow $(this)

		getColumns: (element) ->
			className = element.className.replace('griddlr-column', '').trim()
			classPrefix = @settings.classes.column.replace '*', ''
			return parseInt className.replace classPrefix, ''

		drag: (element) ->
			click = 0
			drag = 0
			offset = 0
			target = element
			columns = @getColumns element

			$(document).on 'mousedown', (e) ->
				if e.target == element
					target = e.target
					click = 1
					offset = e.offsetX
					$('html').css 'cursor', 'ew-resize'

			$(document).on 'mousemove', (e) ->
				if click
					if offset > e.offsetX # moving left
						console.log columns

			$(document).on 'mouseup', (e) ->
				click = 0
				drag = 0
				$('html').css 'cursor', ''

		addColumn: (column) ->
			column.addClass('griddlr-column')
			column.append '<div class="griddlr-button griddlr-button-remove">&times;</div>'
			column.wrapInner '<div class="griddlr-column-inner"></div>'

		bindColumn: (column) ->
			edge = column.innerWidth() - (@_gutter * 2)
			@drag column.get 0
			column.on 'mousemove', (e) ->
				if e.offsetX >= edge
					$('html').css 'cursor', 'ew-resize'
				else
					$('html').css 'cursor', ''

			column.on 'mouseleave', (e) ->
					# $('html').css 'cursor', ''

		setupColumns: ->
			self = @
			@content.find('[class^="'+ @columnClass '' +'"]').each ->
				self.addColumn $(this)
				self.bindColumn $(this)

		bindResize: ->

		collectData: ->
			@log 'Collecting data...'
			@_gutter = parseInt(@dataColumn.css 'padding-left')

		columnClass: (columns) ->
			return @settings.classes.column.replace '*', columns

	$.fn[pluginName] = (options) ->
		@each ->
			unless $.data @, "#{pluginName}"
				$.data @, "#{pluginName}", new Griddlr @, options
