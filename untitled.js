window.H5PLAYER = window.H5PLAYER || {};

var h5Player = (function() {

  // URL pointing to the player endpoint.

  var CONFIG = {
    player_url : "https://player.waywire.com.edwin.dev.magnify.net",
    custom_tag: 'h5player'
  };

  // var CONFIG = {
  //   player_url : ( function() {
  //     var a = document.createElement("a");
  //     a.href =  document.getElementById('h5api').src;
  //     return 'https://'+a.hostname;
  //   } )(),
  //   custom_tag: 'h5player'
  // };


  HTMLElement.prototype.uTriggerEvent = function (event) {
    var evt;
    if ( document.createEvent ) {
      evt = document.createEvent("HTMLEvents");
      evt.initEvent(event, true, true );
      return !this.dispatchEvent(evt);
    } else if ( document.createEvent ) {
      evt = document.createEventObject();
      return this.fireEvent('on'+event,evt);
    }
  };

  HTMLElement.prototype.uAttachEvent = function(evnt, func) {
    if ( this.addEventListener ) this.addEventListener(evnt,func,false);
    else if ( this.attachEvent ) this.attachEvent("on"+evnt, func);
    else                         this[evnt] = func;
  };

  // Converts number of seconds to the format HH:MML:SS
  // eg: seconds.toHHMMSS() => 01:20:10
  Number.prototype.toHHMMSS = function () {
    var time = new Date(this * 1000).toISOString().substr(11, 8);
    if      ( parseInt( time.replace(':','') ) === 0 ) time = "";
    else if ( parseInt( time.substr(0,2) ) <= 0 )      time = time.substr(3, 5);
    return time;
  };

  // Remove a class or an array of classes from an html dom element.
  HTMLElement.prototype.removeClass = function( klass ) {
    if( typeof klass === "string" ) klass = [ klass ];
    var classes = this.className.split(" ");
    this.className = classes.filter(function(el){
      if(klass.lastIndexOf(el) === -1) return true;
      return false;
    }).join(" ");
  };

  HTMLElement.prototype.addClass = function ( klass ) {
    var filtered = this.className.split(" ").filter(function(el){ return el === klass });
    if(filtered.length === 0) this.className += " "+klass;
  };

  HTMLElement.prototype.toggleClass = function ( klass ) {
    var classes = this.className.split(" ");
    if( classes.lastIndexOf(klass) === -1 ) this.addClass(klass)
    else this.removeClass(klass);
  };

  HTMLElement.prototype.setAttributes = function( attrs, append ) {
    var element = this; 
    Object.keys( attrs ).forEach( function( key ) {      
      element.setAttribute( key, attrs[key] );
    });
  }

  var generateID = function() {
    return Math.random().toString(36).substr(2,16).toUpperCase();
  }

  var buildFromTag = function( type, elements ) {
    for ( var i = elements.length; i > 0; --i ) {
      
      var config = generateConfiguration( elements[0] );
      
      if ( type === 'playlist' ) {
        config.external = true;
        var player = window.H5PLAYER[ config.target ];
        if ( player ) player.renderPlaylist( config );
        else console.log('Target with the name '+config.target+' does not exist.');
      }else {
        config.container  = document.createElement( 'div' );
        config.container.setAttributes( config.user_attributes );
        var player = new h5Player( config );
      }

      if ( config.container ) elements[0].parentNode.replaceChild( config.container, elements[0] )
      else elements[0].parentNode.removeChild( elements[0] );
    }
  };

  var generateFromCustomTags = function() {
    var player_elements   = document.getElementsByTagName('h5player');
    var playlist_elements = document.getElementsByTagName('h5playlist');

    buildFromTag( 'player',   player_elements   );
    buildFromTag( 'playlist', playlist_elements );
  };

  var generateConfiguration = function( element ) {
    var config = { user_attributes: {} };
    var user_attributes = { class: true, style: true, alt: true };

    for ( var i = 0; i < element.attributes.length; i++) {
      var attr = element.attributes[i];
      if ( user_attributes[attr.name] || /^data-/.test(attr.name) ) config.user_attributes[attr.name] = attr.value
      else{
        var key     = attr.name.replace(/-\w/g, function(val) { return val[1].toUpperCase(); });;
        var value   = attr.value.split(',');
        value       = value.length > 1 ? value : value[0];
        config[key] = value;
      }
    }
    return config;
  };

  // Searializes object to be passed as url parameters
  // seriralize_params( { hello : "world", see : "you later" } ) => hello=world&see=you%20later
  var serialize_params = function(obj, prefix) {
    var str = [],
      p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix : p,
          v = obj[p];
        str.push((v !== null && typeof v === 'object') ?
          serialize_params(v, k) :
          encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }
    return str.join('&');
  };

  // Pure Javascript 'GET' request.
  var get = function(url, callback, params) {
    return ajax( url, 'get', callback, params );
  };

  // Pure Javascript AJAX request.
  var ajax = function(url, method, callback, params) {
    var obj;
    try {
      obj = new XMLHttpRequest();
    } catch ( e ) {
      try {
        obj = new ActiveXObject( 'Msxml2.XMLHTTP' );
      } catch ( e ) {
        try {
          obj = new ActiveXObject ('Microsoft.XMLHTTP' );
        } catch ( e ) {
          alert('Your browser does not support Ajax.');
          return false;
        }
      }
    }
    obj.onreadystatechange = function() {
      if (obj.readyState == 4) callback(obj);
    }
    obj.open(method, url + '?' + serialize_params(params), true);
    obj.send(null);
    return obj;
  };

  var player_query = function( h5, id , autoplay ) {
    id = id || h5.current_video.id;
    var query = 'id='+id+'&api_id='+h5.api_id+'&time='+Date.now();

    for ( var i in query_options ) {
      if ( h5.player.opts[ i ] ) query += '&'+query_options[ i ]+'='+h5.player.opts[ i ];
    }

    if ( autoplay || h5.player.opts.autoplay ) query += '&autoplay=1'

    return query;
  };

  var validateBoolean = function ( defaultVal ) {
    var typecast = { true: true, false: false, 0: false, 1: true };
    return function( val ) {
      if ( typecast[val] !== 'undefined' ) val = typecast[val];
      return ( typeof val !== 'undefined' ) ?  !!val : defaultVal;
    }
  };

  var validateInteger = function ( defaultVal ) {
    return function( val ) {
      return parseInt( val ) || defaultVal;
    }
  };

  var validateLength = function ( min, max, defaultVal ) {
    return function ( val ) {
      return  ( ( val && val.length >= min && val.length <= max  ) ? val : defaultVal );
    };
  };

  var validateInclusive = function ( possible, defaultVal ) {
    return function ( val ) {
      return possible[val] ? val : defaultVal;
    };
  };

  var validateNone = function( val ) {
    return val;
  }

  var validateVideoID = function () {
    return function ( val ) {
      if ( typeof val === 'string' )   return validateLength( 16, 16, undefined)(val);
      else if ( val instanceof Array ) return validateLength( 1, 500, undefined)(val);
      return undefined;
    };
  };

  var validatePlaylist = function ( variable ) {
    if ( typeof variable != 'object' ) variable = {};
    for ( var i in playlist_options ) variable[i] = playlist_options[ i ]( variable[i] );
    return variable;
  };

  var resize_playlist_fonts = function( playlist ) {
    var options = {
      base     : 200,
      min      : 150,
      max      : 300,
      default  : 10,
      unit     : 'px'
    };
    var ratio         = playlist.type === 'wall' ? 1 / playlist.columns : 0.30;
    var element_width = playlist.container.clientWidth * ratio;
    if      ( options.min && element_width <= options.min ) element_width = options.min
    else if ( options.max && element_width >= options.max ) element_width = options.max;
    playlist.node.style.fontSize = element_width / options.base * options.default + options.unit;
  };

  var player_options = {
    autoplay           : validateBoolean( false ),
    forceAutoplay      : validateBoolean( false ),
    fullscreen         : validateBoolean( false ),
    insecure           : validateBoolean( false ),
    mute               : validateBoolean( false ),
    showInfo           : validateBoolean( true  ),
    volume             : validateInteger( 1 )
  };

  var api_options    = {
    autoloop           : validateInclusive( { off : true, video : true, playlist: true }, 'off' ),
    columns            : validateInteger( 2 ),
    container          : validateNone,
    displayDescription : validateBoolean( false ),
    displayTitle       : validateBoolean( false ),
    height             : validateLength( 1, 100, undefined ),
    highlightCurrent   : validateBoolean( true  ),
    playlist           : validatePlaylist,
    video              : validateVideoID(),
    width              : validateLength( 1, 100, undefined ),
    showPlayer         : validateBoolean( true ),
    target             : validateNone,
  };

  var playlist_options = {
    columns : validateInteger ( 3 ),
    expand  : validateBoolean ( false ),
    fluid   : validateBoolean ( false ),
    id      : validateLength  ( 16, 16, undefined ),
    limit   : validateInteger ( undefined ),
    type    : validateInclusive ( { wall: true, sidebar: true, bottombar: true }, 'wall' ),
    visible : validateBoolean ( true ),
    scroll  : validateBoolean ( true )
  };

  var events         = {
    ads_complete       : true,
    ads_error          : true,
    ads_first_quartile : true,
    ads_midpoint       : true,
    ads_skip           : true,
    ads_start          : true,
    ads_third_quartile : true,
    autoloop           : true,
    cancel_fullscreen  : true,
    cancel_pip         : true,
    complete           : true,
    error              : true,
    first_play         : true,
    first_quartile     : true,
    impression         : true,
    midpoint           : true,
    pause              : true,
    mute               : true,
    play               : true,
    request_fullscreen : true,
    request_pip        : true,
    set_volume         : true,
    start              : true,
    third_quartile     : true,
    time_progressed    : true,
    unmute             : true
  };


  // All of the possible query options that can be passed to h5Player
  var query_options = {
    mute           : "mute",
    insecure       : "insecure",
    showInfo       : "show_info",
    // volume         : "volume",
    // autoplay       : "autoplay",
    // forceAutoplay  : "force_autoplay",
    fullscreen     : "fullscreen",
  };

  /****\
    *
    * var h5Player = new h5Player ( {
    *    container : "player",
    *    video  : "HJSGSUUMSHSL56578",
    *    playlist: {
    *       id: "" || [],
    *       visible:
    *       fluid:
    *       expand:
    *       wall: sidebar: or bottom_bar:
    *    }
    * } );
    *
  \****/

  // TODO: Solidify all the options after creation based on all of the options provided
  var h5Player = function(opts) {

    //Required
    for ( var i in api_options )  this[i] = api_options[i]( opts[i] );
    // this.container = opts.container;

    // console.log(this.playlist);

    // if( !this.video && !this.playlist.id ) throw "Need to specify container and video or playlist.";
    if ( !this.showPlayer && !this.target ) throw "Need to provide a target when creating a plalist.";

    this.api_id = opts.id || Math.random().toString(36).substr(2,16).toUpperCase();

    // Player Configuration
    this.player = {}; this.player.opts = {};
    for ( var i in player_options ) this.player.opts[i] = player_options[i](opts[i]);

    // Video configurations
    this.current_video = {};
    // build the layout
    this.buildLayout();
    //
    window.H5PLAYER[ this.api_id ]  = this;

    this.container.appendChild( this.element );

    var h5_player = this;

    this.on('time_progressed', function(event){ h5_player.current_video.currentTime = event.data.current_time; });
    this.on('set_volume',      function(event){ h5_player.player.opts.volume = parseFloat(event.data.volume);});
    this.on('autoloop',        function(event){ h5_player.autoloop = event.data.autoloop; });
    this.on('complete',        function(event){
      h5_player.current_video.complete = true;
      if(h5_player.autoloop === "video"   ) h5_player.switchVideo( h5_player.current_video.id, undefined , h5_player.player.opts.autoplay );
      if(h5_player.autoloop === "playlist") h5_player.loadNext( h5_player.player.opts.autoplay );
    });

  };


  h5Player.prototype = ( function() {

    // Public Methods
    // Add a check against a hash of possble events that we have listed
    var on = function(type, callback) {
      var h5 = this;
      window.addEventListener("message", function(event) {
        if ( !event.data.player_event || event.data.h5_api != h5.api_id ) return;
        if ( event.data.type === type ) callback(event.data, h5);
      }, false);
    };

    // Switches the video by changing the src of the iframe.
    // Refactor
    var switchVideo = function( vid, pid, autoplay ){
      if ( this.playlists.list.length === 0 ) return this.setVideo( vid, autoplay ); 
      
      pid = ( pid !== undefined ? pid : this.playlists.position );

      var playlist  = this.getPlaylist( pid );
      var video     = playlist.getVideo( vid );

      if ( !video ) return;

      if ( this.setPlaylist( playlist.index, video.index ) ) return this.setVideo( video, autoplay );
    };

    var setVideo = function( video, autoplay ) {
      if      ( typeof video === 'object' ) this.current_video = video
      else if ( typeof video === 'string' ) this.current_video = { id: video }
      else    return;
      this.current_video.complete       = false;
      this.current_video.currentTime    = 0;
      this.current_video.paused         = false;
      this.current_video.muted          = this.player.opts.mute;
      this.current_video.src            = this.player.element.src;
      this.header_node.innerHTML        = "<span>" + this.current_video.title +"</span>";
      this.description_node.innerHTML   = "<p>" + this.current_video.description + "</p>";
      if ( this.highlightCurrent && this.currentPlaylist() ) _highlight_video( this );
      this.player.element.src = CONFIG.player_url+"/?" + player_query(this, this.current_video.id, autoplay );
      return this.current_video;
    }

    // Builds the layout of the playlist.

    var buildLayout = function() {
      // Build the dom elements
      // get the container
      if ( !this.container ) {
        this.container = "h5Player";
        document.write('<div id=h5Player></div>');
      };

      this.container = this.container instanceof HTMLElement ?
        this.container : document.getElementById(this.container);

      // build the wrapper
      this.element            = document.createElement("div");
      this.element.className += "h5-wrapper";

      if ( this.width  ) this.element.style.width  = this.width;
      if ( this.height ) this.element.style.height = this.height;

      // build the player container
      var h5_player_container        = document.createElement('div');
      h5_player_container.className += " h5-player-container";

      // build the iframe
      this.player.element            = document.createElement('iframe');
      this.player.element.className += "h5-player";
      this.player.element.setAttribute("frameBorder", "0");
      this.player.element.setAttribute('allowFullScreen', '');
      this.player.element.setAttribute('webkitallowfullscreen', '');
      this.player.element.setAttribute('mozallowfullscreen', '');
      this.player.element.setAttribute('oallowfullscreen', '');
      this.player.element.setAttribute('msallowfullscreen', '');

      // build the header node
      this.header_node            = document.createElement('div');
      this.header_node.id         = "h5-header";
      this.header_node.className += " h5-header";

      // build the description node
      this.description_node            = document.createElement('div');
      this.description_node.id         = "h5-description";
      this.description_node.className += " h5-description";


      h5_player_container.appendChild( this.player.element );

      if ( this.showPlayer ) this.element.appendChild( h5_player_container );

      this.playlists = { list: [], position: 0, map: {} };

      if   ( this.playlist.id || this.video instanceof Array ) this.renderPlaylist( this.playlist )
      else this.setVideo( this.video );

      this.container.appendChild( this.element );
    };

    var getPlaylist = function( pindex ) {
      if ( typeof pindex === 'string' ) return this.playlists.map[pindex];
      return this.playlists.list[pindex];
    };

    var setPlaylist = function( pindex, vindex ) {
      var playlist = this.getPlaylist(pindex);
      if ( !playlist ) return;
      if ( vindex === undefined ) { this.playlists.position = pindex; return playlist };
      var video = playlist.getVideo( vindex );
      if( !video ) return;
      this.playlists.position = playlist.index
      playlist.position       = video.index;
      return playlist;
    };

    var nextPlaylist = function(){
      return this.getPlaylist( this.playlists.position + 1 );
    }

    var previousPlaylist = function(){
      return this.getPlaylist( this.playlists.position - 1 );
    }

    var currentPlaylist = function() {
      return this.playlists.list[ this.playlists.position ];
    }

    var destroyPlaylist = function( id ){
      var playlist = this.getPlaylist( id );
      this.playlists.splice(playlist.index, 1);
      delete this.playlists.map[ playlist.id ];
      for ( var i = 0; i < this.playlists.list.length; i++ ) this.playlists.list[i].index = i;
      if ( this.playlists.position > playlist.index ) this.playlists.postion -= 1;
    }

    var loadNext        = function( play ) {
      var playlist = this.playlists.position;
      var position = this.currentPlaylist().position + 1;

      if ( position >= this.currentPlaylist().videos.length ){
        playlist = ( playlist + 1 ) % this.playlists.list.length;
        position = 0;
      }
      this.switchVideo( position, playlist, play );
    };

    var loadPrevious    = function( play ) {
      var playlist = this.playlists.position;
      var position = this.currentPlaylist().position - 1;

      if ( position < 0 ) {
        playlist = playlist - 1 ;
        if ( playlist < 0 ) playlist = this.playlists.list.length - 1;
        position = this.playlists.list[ playlist ].videos.length - 1;
      }
      this.switchVideo( position, playlist, play );
    };

    var playNext        = function() {
      this.loadNext(true)
    };
    var playPrevious    = function() {
      this.loadPrevious(true);
    };

    var enableAutoloop  = function() { _postH5({ h5Api : this, event : "autoloop" }); };

    var toggleExpand = function( toggle ) {
      if ( toggle === 0 ) return _contract_player(this);
      if ( toggle === 1 ) return _expand_player(this);

      var player_container = this.container.getElementsByClassName("h5-player-container")[0];
      player_container.removeClass('fluid' );
      player_container.toggleClass('expand');
    }

    var toggleFluid = function( toggle ) {
      for ( var i = 0; i < this.playlists.list.length; i++) this.playlists.list[i].toggleFluid( toggle );
    };

    var togglePlaylist  = function( toggle ) {
      for ( var i = 0; i < this.playlists.list.length; i++) this.playlists.list[i].toggle( toggle );
    };

    // Changes the playlist to the specified type.
    var playlistType = function( type ) {
      for ( var i = 0; i < this.playlists.list.length; i++)  this.playlists.list[i].setType( type );
    };

    // Sets the amount of columns that the playlist will occupy.
    var setPlaylistColumns = function( columns ) {
      for ( var i = 0; i < this.playlists.list.length; i++) this.playlists.list[i].setColumns( columns );
    };

    // Sets the players width based on the columns specified.

    var setPlayerColumns = function( columns ) {
      var playlist = this.playlists.list[0];
      columns = parseInt(columns);
      
      if ( !columns || !playlist )      return;
      if ( columns > playlist.columns ) columns = playlist.columns;

      this.columns = columns;

      var player_container = this.player.element.parentNode;
      var width = ( 100 / playlist.columns * columns ) + '%';
      player_container.style.width = width;

      return this.valueOf('player_columns');
    };

    var currentTime       = function()         { return this.current_video.currentTime; };
    var currentVideo      = function()         { return this.current_video };

    var play              = function()         { _postH5({ h5Api: this, event: "play" }); this.current_video.paused = false };
    var pause             = function()         { this.current_video.paused = true; _postH5({ h5Api: this, event: "pause" }); };
    var seekTo            = function( pos )    { _postH5({ h5Api: this, event: "seekTo", args: [pos] }) };

    var volume  = function( vol ){
      if( this.current_video.muted ) return "muted";
      if( typeof vol !== "number" &&  isNaN( Number.parseFloat(vol) ) ) return this.player.opts.volume;

      _postH5({ h5Api: this, event: "volume", args: [vol] });
    };

    var setAutoloop = function(){
      _postH5({ h5Api: this, event: "autoloop", args: [this.autoloop] });
    };

    var toggleShowInfo = function( toggle ){
      this.player.opts.showInfo = !this.player.opts.showInfo;
      _postH5({ h5Api: this, event: "toggleShowInfo"});
    };

    var toggleMute        = function( toggle ){
      this.current_video.muted = !this.current_video.muted;
      this.player.opts.mute = !this.player.opts.mute;
      _postH5({ h5Api: this, event: "toggleMute"})
    };

    var toggleTitle = function( toggle ){
      var is_empty = !this.current_video.title || /^\s*$/.test( this.current_video.title );
      var contains = this.container.contains( this.header_node );

      if ( toggle === undefined ) toggle = ( this.displayTitle = !this.displayTitle );

      if      ( ( !toggle || is_empty )  && contains ) this.container.removeChild( this.header_node );
      else if ( toggle && !is_empty                  ) this.container.insertBefore( this.header_node, this.container.firstChild );
    };

    var toggleDescription = function( toggle ){
      var is_empty = !this.current_video.description || /^\s*$/.test( this.current_video.description );
      var contains = this.container.contains( this.description_node );

      if ( toggle === undefined ) toggle = ( this.displayDescription = !this.displayDescription );

      if ( ( !toggle || is_empty )  && contains ) this.container.removeChild( this.description_node )
      else if( toggle && !is_empty )              this.container.insertBefore( this.description_node, this.element );
    };

    var valueOf = function( prop ){
      return this.current_video[prop];
    };
    
    var renderPlaylist = function( opts ) {

      if ( this.playlists.map[ opts.id ] ) opts.id = undefined;

      opts.id     = opts.id || generateID();
      opts.player = this;

      if ( !opts.external ) opts.container = this.element;
      else {
        opts.container            = this.element.cloneNode(false);
        opts.container.className += " "+opts.user_attributes.class; delete opts.user_attributes.class;
        opts.container.style     += " "+opts.user_attributes.style; delete opts.user_attributes.style;
        opts.container.setAttributes( opts.user_attributes );
      }; 

      var playlist = new h5Playlist(opts);
      
      playlist.addVideos({
        video    : this.video,
        playlist : playlist.id,
        page     : playlist.page,
        limit    : playlist.limit
      })

      playlist.index         = this.playlists.list.length;
      
      this.playlists.map[playlist.id] = playlist;
      this.playlists.list.push( playlist );

      playlist.container.appendChild( playlist.node );

      return playlist;
    };

    // Post method to theh5Api iframe.
    var _postH5 = function( opts ) { // opts = { h5Api : this, event : "setVolume", args: [ 75 ] }
      opts.h5Api.player.element.contentWindow.postMessage({
        type: opts.event,
        args: opts.args
      }, "*");
    };

    var _highlight_video = function( h5 ){
      var selected = document.getElementsByClassName('h5-thumb-selected');
      for ( var i = 0; i < selected.length; i++ ) selected[i].removeClass('h5-thumb-selected');
      h5.current_video.node.addClass('h5-thumb-selected');
    }

    var _expand_player = function( h5 ) {
      var player_container = h5.container.getElementsByClassName("h5-player-container")[0];
      player_container.removeClass('fluid' );
      player_container.addClass('expand');
    };

    var _contract_player = function( h5 ) {
      var player_container = h5.container.getElementsByClassName("h5-player-container")[0];
      player_container.removeClass( 'expand' );
    };

    // Return
    return {
      buildLayout        : buildLayout,
      currentTime        : currentTime,
      currentVideo       : currentVideo,
      enableAutoloop     : enableAutoloop,
      loadNext           : loadNext,
      loadPrevious       : loadPrevious,
      on                 : on,
      pause              : pause,
      play               : play,
      playlistType       : playlistType,
      playNext           : playNext,
      playPrevious       : playPrevious,
      seekTo             : seekTo,
      setAutoloop        : setAutoloop,
      setPlayerColumns   : setPlayerColumns,
      setPlaylistColumns : setPlaylistColumns,
      setVideo           : setVideo,
      switchVideo        : switchVideo,
      toggleDescription  : toggleDescription,
      toggleExpand       : toggleExpand,
      toggleFluid        : toggleFluid,
      toggleMute         : toggleMute,
      togglePlaylist     : togglePlaylist,
      toggleShowInfo     : toggleShowInfo,
      toggleTitle        : toggleTitle,
      valueOf            : valueOf,
      volume             : volume,
      renderPlaylist     : renderPlaylist,
      nextPlaylist       : nextPlaylist,
      previousPlaylist   : previousPlaylist,
      destroyPlaylist    : destroyPlaylist,
      currentPlaylist    : currentPlaylist,
      setPlaylist        : setPlaylist,
      getPlaylist        : getPlaylist
    };


  })();

  var h5Playlist = function( opts ) {
    
    this.id    = opts.id || generateID();
    this.player = opts.player;
    for ( var i in playlist_options ) this[i] = playlist_options[i](opts[i]);
    
    this.container       = opts.container;
    this.node            = document.createElement('div');
    this.node.className += " h5-playlist";
    
    var playlist = this;

    if ( this.scroll )  this.node.addEventListener( 'scroll' , function(e) {
        var at_end = false;
        var trigger_offset = 100;
        if ( playlist.pending || playlist.end ) return;

        if      ( playlist.type === 'sidebar'   ) at_end = ( playlist.node.scrollHeight - playlist.node.clientHeight <= playlist.node.scrollTop + trigger_offset )
        else if ( playlist.type === 'bottombar' ) at_end = ( playlist.node.scrollWidth  - playlist.node.clientWidth  <= playlist.node.scrollLeft + trigger_offset );

        if ( at_end ) playlist.addVideos({
                        video    : playlist.player.video,
                        playlist : playlist.id,
                        page     : playlist.page,
                        limit    : playlist.limit
                      });
    });

    this.page     = 0;
    this.map      = {};
    this.videos   = [];
    this.position = 0;

  };

  h5Playlist.prototype = ( function() {

    var _build_video_elements = function( playlist, items ) {
      var has_video = playlist.videos.length > 0;
      for ( var i = 0; i < items.length; i++ ){
        if ( !playlist.map[ items[i].id ] ) _build_video( playlist, items[i] );
      }
      playlist.pending = false;
      playlist.page   +=  1;
      if ( !has_video ) _configure(playlist);
    };

    var _build_video = function ( playlist, json ) {
      json.node = _build_video_element( json );
      json.node.onclick = function(event){ playlist.switchVideo( json.id ); };
      json.index = playlist.videos.length;
      playlist.node.appendChild( json.node );
      playlist.videos.push( json );
      playlist.map[json.id] = json;
      return json;
    };

    var _build_video_element = function( json ) {
      var content_item = document.createElement('li');

      content_item.className += " h5-thumb";
      content_item.className += " h5-thumb-"+json.id;
      content_item.style.backgroundImage = "url("+json.thumbnail+")";
      content_item.innerHTML += "<span class='title'><span class='text'>"+json.title+"</span></span>";
      content_item.innerHTML += "<span class='duration'>"+json.duration.toHHMMSS()+"</span>";
      content_item.innerHTML += "<span class='play'>&#9654;</span>";

      return content_item;
    };

    var _configure = function( playlist ) {
      if ( playlist.videos.length === 0 ) throw "No video available to play.";
      else if ( playlist.player.currentPlaylist() === playlist ) playlist.switchVideo( 0 , playlist.player.player.opts.autoplay );

      if ( playlist.expand  ) playlist.player.toggleExpand( 1 );
      if ( playlist.fluid   ) playlist.toggleFluid( 1 );
      if ( playlist.type    ) playlist.setType( playlist.type );
      if ( playlist.visible ) playlist.toggle( 1 );

      playlist.setColumns( playlist.columns );
    };

    return {

      toggleFluid: function( toggle ) {
        if ( toggle === undefined ) this.fluid = !this.fluid
        else if ( toggle ) this.fluid = true;
        else this.fluid = false;

        if ( this.fluid ) this.container.addClass('fluid');
        else              this.container.removeClass('fluid');
      },

      setType: function( type ) {
        var types = { wall: true, sidebar: true, bottombar: true };
        if (  !types[type] ) throw "The playlist must be set to 'wall', 'sidebar', or 'bottombar'.";
        this.type = type;
        this.container.removeClass(['wall', 'sidebar', 'bottombar']);
        this.container.addClass(type);
        resize_playlist_fonts( this );
      },

      toggle: function( toggle ) {
        if ( toggle === undefined ) this.visible = !this.visible
        else this.visible = !!toggle;

        if ( this.visible ) this.container.addClass('playlist')
        else this.container.removeClass('playlist')
      },

      setColumns: function( columns ) {
        columns = parseInt(columns);
        if ( !columns ) return;

        var width  = ( 100 / columns ) + "%";

        for ( var i in this.videos ) {
          if ( typeof this.videos[i].node !== 'undefined' ) this.videos[i].node.style.width = width;
        }

        this.columns = columns;
        resize_playlist_fonts(this);
        this.player.setPlayerColumns( this.player.columns );
      },

      addVideos: function( opts ) {

        var params = { id: [] }
        
        if ( opts.video instanceof Array ) params.id = opts.video
        else if ( typeof opts.video === 'string' ) params.id.push( opts.video );

        if ( opts.playlist instanceof Array ) params.id       = params.id.concat( opts.playlist )
        else if ( opts.playlist )             params.playlist = opts.playlist;

        params.page =  ( opts.page || 0 ) + 1;
        
        if ( opts.limit ) params.per_page = opts.limit;
        
        this.pending = true;

        var playlist   = this;
        var has_videos = this.videos.length > 0; 
        
        get( CONFIG.player_url + "/api/queue", function(res) {
          var json = JSON.parse( res.response );
          if ( res.status != 200 || json.error || !json.items.length ) return;
          _build_video_elements( playlist, json.items );
        },  params );

      },

      getVideo: function( id ) {
        if ( typeof id === 'string' ) return this.map[id];
        return this.videos[ id ];
      },

      setVideo: function( id ) {
        var video = getVideo(id);
        if ( !video ) return; 
        this.position = video.index
        return video;
      },

      destroyVideo: function( video ) {
        var video = this.getVideo( id );
        this.videos.splice(video.index, 1);
        delete this.map[ video.id ];
        for ( var i = 0; i < this.videos.length; i++ ) this.videos[i].index = i;
        if ( this.position > video.index ) this.postion -= 1;
      },

      switchVideo: function( id, autoplay ) {
        var video = this.getVideo(id);
        if ( video ) return this.player.switchVideo( video.index, this.index, autoplay );
      }
    }

  })();

  window.onload = function(){
    generateFromCustomTags();
  };

  return h5Player;

})();