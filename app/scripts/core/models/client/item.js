define([
  'backbone.associations',
  '../qt_basemodel'
],

function (Backbone,BaseModel) {

  'use strict';

  return BaseModel.extend({
    defaults: {
      id : 0,
      date_added : '',
      date_modified : '',
      description : '',
      file : '',
      hdf5 : '',
      lock : undefined, //bool true|false
      mime_type : '',
      sha1 : '',
      title : '',
      url : '',
      uuid : '',
      audio_duration : 0, //en secondes!!
      audio_url : {} //{mp3 : URL, ogg : URL}

    },

    relations: [],

    //////////////////////////////////////////

  });
});
