define([
  'underscore',
  'backbone',
  'handlebars',
  'd3',
  'text!chartSvgItem',
  'config'

], function( _, Backbone, Handlebars, d3, ChartSvgItem, Config ) {

  var GeneralSVGView = Backbone.View.extend({
    className : 'svgChartItem active',

    template : Handlebars.compile( ChartSvgItem ),

    events : {
      'click' : 'triggerActiveModel',

      'click .closeBtn'     : 'deleteChart',

      'click svg'           : 'handleSvgClick',

      'blur h3'             : 'handleNameChange',

      'mousedown  .changeSizeBtn' : 'handleMouseDownViewSize',
      'mouseup    .changeSizeBtn' : 'handleMouseUpViewSize',
      'mouseleave .changeSizeBtn' : 'handleMouseLeaveViewSize',

      'mousedown .moveBtn' : 'handleMouseDownMove',
      'mouseup   .moveBtn' : 'handleMouseUpMove',

      'mouseleave' : 'handleMouseLeaveView'
    },


    initialize : function( chart ) {
      this.model = chart;

      this.$el.attr({
        id        : 'svgChartItem-' + this.model.cid
      });

      this.$el.addClass( 'fontawesome-' + this.model.get( 'config' ).icon );

      this.listenTo( this.model, 'destroy', this.remove );
      this.listenTo( this.model, 'sync', this.render );
      this.listenTo( this.model, 'change:highlighted', this.handleModelHighlight );
      this.listenTo( this.model, 'error', this.renderError );
    },


    render : function() {
      var html = this.$el.html(
                this.template({
                  name : this.model.get( 'name' )
                })
              );

      this.$el.css({
        height : Config.svgChartView.height,
        width  : Config.svgChartView.width
      });

      if ( this.model.get( 'data' ) ) {
        if (
          this.renderHtmlPart &&
          typeof this.renderHtmlPart === 'function'
        ) {
          this.renderHtmlPart();
        }

        if ( this.model.get( 'data' ) ) {
        // if data is already fetched
          this.renderSvg();
        }
      }

      return html;
    },


    renderError : function( model, response ) {
      console.log( 'render error!!!', response );
      this.$el.append(
        '<div class="errorMessage">' +
          this.model.get( 'error' ).message + '<hr>' +
          response.code + ' ' + response.status + ' ' + response.message +
        '</div>'
      );
    },


    deleteChart : function() {
      this.model.destroy();
    },


    handleModelHighlight : function( model, highlighted ) {
      if ( highlighted ) {
        this.$el.addClass( 'highlighted' );
      } else {
        this.$el.removeClass( 'highlighted' );
      }
    },


    handleNameChange : function( event ) {
      this.model.set( 'name', event.target.innerText );
    },


    handleSvgClick : function( event ) {
      var target     = event.target,
          attributes = target.attributes,
          action;
      try {
        action = attributes.getNamedItem( 'data-action-click' ).value;
      } catch( e ) {}

      if ( action && this[ action ] && typeof this[ action ] === 'function' ) {
        this[ action ]( event, target );
      }
    },


    handleMouseDownMove : function( e ) {
      var dragHeight = this.$el.outerHeight(),
          dragWidth  = this.$el.outerWidth(),
          dragOffset = this.$el.offset(),
          posY       = dragOffset.top + dragHeight - e.pageY,
          posX       = dragOffset.left + dragWidth - e.pageX;

      this.$el.addClass( 'draggable' );

      this.$el.on( 'mousemove', _.bind( function(e) {
        if ( this.$el.hasClass( 'draggable' ) ) {
          this.$el.offset({
            top  : e.pageY + posY - dragHeight,
            left : e.pageX + posX - dragWidth
          });
        }
      }, this ) );

      e.preventDefault();
    },


    handleMouseDownViewSize : function( e ) {
      var changeSizeBtn = this.$changeSizeBtn || this.$( '.changeSizeBtn' ),
          dragHeight    = this.$el.outerHeight(),
          dragWidth     = this.$el.outerWidth(),
          dragOffset    = this.$el.offset();

      // save it for later
      this.$changeSizeBtn = changeSizeBtn;

      changeSizeBtn.addClass( 'draggable' );

      changeSizeBtn.on( 'mousemove', _.bind( function(e) {
        if ( changeSizeBtn.hasClass( 'draggable' ) ) {
          this.$el.css({
            width  : dragWidth + e.pageX - ( dragWidth + dragOffset.left ) - this.$changeSizeBtn.outerWidth() / 2,
            height : dragHeight + e.pageY - ( dragHeight + dragOffset.top ) + this.$changeSizeBtn.outerHeight() / 2
          });
        }
      }, this ) );

      e.preventDefault();
    },


    handleMouseLeaveView : function( e ) {
      this.$el.removeClass( 'draggable' );
    },


    handleMouseLeaveViewSize : function( e ) {
      // don't touch dom when there is no need to
      if (
        this.$changeSizeBtn &&
        this.$changeSizeBtn.hasClass( 'draggable' )
      ) {
        this.$changeSizeBtn.removeClass( 'draggable' );
      }
    },


    handleMouseUpViewSize : function( e ) {
      if (
        this.$changeSizeBtn &&
        this.$changeSizeBtn.hasClass( 'draggable' )
      ) {
        this.$changeSizeBtn.removeClass( 'draggable' );
      }

      this.renderSvg();
    },


    handleMouseUpMove : function( e ) {
      this.$el.removeClass( 'draggable' );
    },


    remove : function() {
      this.$el.addClass( 'removed' )
              .on(
                'animationend webkitAnimationEnd otransitionend',
                _.bind( function() {
                  this.$el.remove();
                }, this )
              );
    },


    triggerActiveModel : function() {
      this.model.trigger( 'activate', this.model );
    }
  });

  return GeneralSVGView;
});
