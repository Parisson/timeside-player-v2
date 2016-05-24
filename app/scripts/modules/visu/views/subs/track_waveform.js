define([
  'marionette',
  '#qt_core/controllers/all',
  '#navigation_core/baseviews/base_qeopaview',
  'd3',
  '#visu/controllers/providers/waveform_dataprovider'
],

function (Marionette,A,BaseQeopaView,d3,WaveformDataProvider) {
  'use strict';

  /**
    Waveform track
      Méthodes à exposer : 
        init(typeData)
          va récupérer les global datas, générer et afficher

  **/
  return BaseQeopaView.extend({

    template: templates['visu/sub_track_waveform'],
    className: 'track-waveform',

    ui: {
     
    },
    events: {
      
    },

    ////////////////////////////////////////////////////////////////////////////////////
    //Define
    /*input obj is {type : _type, width : width, height : height}*/
    defineTrack:function(o) {
      this.width = o.width;
      this.height = o.height;

      

      this.dataProvider = new WaveformDataProvider();
      this.dataProvider.define(o.type,this);
    },

    /**
      Init function : va récupérer les data globales et le specific data
    **/
    init:function() {
      this.createGraphicBase();
      this.dataProvider.init();
    },


    /**
      From dataprovider
    **/
    setVisibleData:function(data) {
      this.hadFirstData = true;


      //debug value
      var _debug = "",showDebug=false;
      if (data.length<100) {
        _.each(data,function(_obj) {
          _debug=_debug+"("+_obj.time+','+_obj.value+")";
        })
        console.log('DEBUG : '+_debug);
        showDebug=true;
      }
      showDebug=false;//hop

      A.log.log('track_waveform','setVisibleData----------------- on '+data.length);

      this.MAX_VALUE = A._i.getOnCfg('trackInfoController').getMaxValue();

      var height = this.height;
      var width = this.width;
      var bar_width = width / data.length;

      //update scales
      this.yScale = d3.scale.linear().range([height, -height]);
      var max_val = this.MAX_VALUE;
      this.yScale.domain([-max_val, max_val]);

      var trackDuration = A._i.getOnCfg('trackInfoController').getDuration();
      //this.xScale = d3.scale.linear().domain([0, 1024]); //TMP
      A.log.log('track_waveform:setVisibleData',' X scale will go from '+data[0].time+'->'+data[data.length-1].time);
      this.xScale = d3.time.scale().domain([data[0].time,data[data.length-1].time]).range([0,width]);

      //go
      var chart = this.d3chart;
      var x=this.xScale,y = this.yScale;

      var newdata =  chart.selectAll("g").data(data,function(d) {return d.time;});
      var self=this;
      //ENTER
      newdata.enter().append("g") // svg "group"
        .attr("transform", function(d, i) {
          var translateX = self.xScale(d.time);
          if (showDebug)
            console.log('     X : '+d.time+' --> '+translateX);
          return "translate(" + translateX /** bar_width*/ + ",0)";
          //return "translate(" + i * bar_width + ",0)";
        })
        .append("rect")
        .attr("y", function(d) {
          var yv = height - Math.abs(y(d.value)/2) - height/2 + 2;
          return yv;
        })
        .attr("height", function(d) {
          return Math.abs(y(d.value)); })
        .attr("width", bar_width );

      //STILL HERE
      //@Todo : optim : don't do width/height/y here
      chart.selectAll("g")/*.transition(0.75)*/.attr("transform", function(d, i) {
          var translateX = self.xScale(d.time);

          if (showDebug)
            console.log('     X2 : '+d.time+' --> '+translateX);
          return "translate(" + translateX /** bar_width*/ + ",0)";
          //return "translate(" + i * bar_width + ",0)";
        }).select('rect')
        .attr("y", function(d) {
          var yv = height - Math.abs(y(d.value)/2) - height/2 + 2;
          return yv;
        })
        .attr("height", function(d) {
          return Math.abs(y(d.value)); })
        .attr("width", bar_width );  

      newdata.exit().remove();
        
    },
   
    ////////////////////////////////////////////////////////////////////////////////////
    //Generate graph

    /*Base chart creation*/
    createGraphicBase:function() {
      var height = this.height;
      var width = this.width;

      var node = d3.select(this.$el.find('.container_track_waveform > .svg')[0]).append("svg")
        .attr("class","chart")
        .attr("width", width)
        .attr("height", height);


      
      //below a tester ensuite
      //this.xScale = d3.scale.linear().domain([0, trackDuration]);

      var chart = node.attr("width", width).attr("height", height);
      this.d3chart = chart;  
    },





    /*BELOW : OLD FUNCS*/

    startLoading:function(width,height) {
      
      this.width = width;
      this.height = height;

      //server to be ready
      this.loadData();
    },


    //1 : load data
    loadData:function() {
      var trackDuration = A._i.getOnCfg('trackInfoController').getDuration();
      A._v.trigCfg('fakeserver.getdata','',0,trackDuration,1024,_.bind(this.onData,this));
    },

    //2 : keep data & start rendering
    onData:function(data) { 
      console.log('hey im so happy');
      this.data = data;
      this.createBaseChart();
    },

    //////////////////////////////////
    // Render methods

    //1
    //creates the chart, kept as this.d3chart
    createBaseChart:function() {
      

      var bar_width = width / data.length;

      var bar = chart.selectAll("g")
        .data(data,function(d) {return d.time;})
        .enter().append("g") // svg "group"
        .attr("transform", function(d, i) {
          return "translate(" + i * bar_width + ",0)";
        })
        .append("rect")
        .attr("y", function(d) {
          var yv = height - Math.abs(y(d.value)/2) - height/2 + 2;
          return yv;
        })
        .attr("height", function(d) {
          return Math.abs(y(d.value)); })
        .attr("width", bar_width );
    },

    

    /////////////////////////////////////////////////////////////////////////////////////
    //new window navigator

    //here : trackinfo is already updated
    onNavigatorNewWindow:function() {
      //new window selected!
      if (! this.hadFirstData)
        return;
      this.dataProvider.getUpdatedDataForView();


    },

    ////////////////////////////////////////////////////////////////////////////////////
    initialize: function () {
      A._v.onCfg('navigator.newWindow','',this.onNavigatorNewWindow,this);
    },

    onRender:function() {
       
    },

    onDestroy: function () {      
      A._v.offCfg('navigator.newWindow','',this.onNavigatorNewWindow,this);
    },


    serializeData: function () {
      

      return {
       
      }
    },


    
    
   
  });
});
