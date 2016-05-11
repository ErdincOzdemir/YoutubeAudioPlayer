var youtubeAudio = {
	create: function(options) {
		var body = document.getElementsByTagName('body')[0];
		var players = [];
		
		var apiTag = document.createElement('script');
		apiTag.src = utils.constants.youtubeIframeApiUrl;
		document.head.appendChild(apiTag);
		
		var bootstrapTag = document.createElement('link');
		bootstrapTag.href = utils.constants.bootstrapUrl;
		bootstrapTag.rel = 'stylesheet';
		bootstrapTag.crossorigin = 'anonymous';
		document.head.appendChild(bootstrapTag);
		
		window.onYouTubeIframeAPIReady = function() {
			players = youtubeAudio.loadPlayer(players);
		};
		
		var doms = document.getElementsByClassName('player');
		[].forEach.call(doms, function(dom, index) {
			var playerController = dom;
			
			var youtube_link = playerController.getAttribute(utils.constants.youtubeLinkKey);
			var id = utils.getVideoId(youtube_link);
			var domId = 'audio_' + index;
			body.appendChild(utils.createDiv(domId));
			
			var video = {
				domId: domId,
				videoId: id,
				controller: playerController,
				player: null
			};					
			players.push(video);
			
			playerController.addEventListener('click', function() {
				var dataEmbeddable = playerController.getAttribute(utils.constants.embeddableKey);
				var dataPlaying = playerController.getAttribute(utils.constants.playingKey);
				
				if(dataEmbeddable != undefined && dataEmbeddable === 'false') return;
				
				if(!options.multiple) {
					[].forEach.call(players, function(ytPlayer, ytIndex) {
						if(index === ytIndex) return;
												
						var ytEmbeddable = ytPlayer.controller.getAttribute(utils.constants.embeddableKey);
						if(ytEmbeddable != undefined && ytEmbeddable === 'false') return;
						ytPlayer.player.pauseVideo();
						ytPlayer.controller.className = utils.constants.playIconClass;
						ytPlayer.controller.setAttribute(utils.constants.playingKey, 'false');
					});
				}
					
				if(dataPlaying == undefined || dataPlaying === 'false') {
					players[index].player.playVideo();
					playerController.className = utils.constants.playerClass+ ' ' +  utils.constants.pauseIconClass;
					playerController.setAttribute(utils.constants.playingKey, 'true');						
				} else {
					players[index].player.pauseVideo();
					playerController.className = utils.constants.playerClass+ ' ' +  utils.constants.playIconClass;
					playerController.setAttribute(utils.constants.playingKey, 'false');
				}
			})
		});	
	},			
	loadPlayer: function(players) {
		var result = [];
		[].forEach.call(players, function(player) {
			var ytPlayer = new YT.Player(player.domId, {
				height: '0',
				width: '0',
				videoId: player.videoId,
				events: {
					'onReady': function(event) {
						event.target.playVideo();
						event.target.pauseVideo();
						player.controller.className = utils.constants.playIconClass;
						player.controller.style.cursor = 'pointer';
					},
					'onError': function(event) {
						if(!options.showNotEmbeddable) { 
							player.controller.parentNode.removeChild(player.controller); 
							console.error('Video ' + player.controller.getAttribute(utils.constants.youtubeLinkKey) + ' is not embeddable!')
						}
						player.controller.className = utils.constants.alertIconClass;
						player.controller.setAttribute(utils.constants.embeddableKey, 'false');
					},
					'onStateChange': function(event) {
						if(event.data === 0) {									
							player.controller.className = utils.constants.playIconClass;
							player.controller.setAttribute(utils.constants.playingKey, 'false');
						}
					}
				}
			});
			player.player = ytPlayer;
			result.push(player);
		});
		return players;
	}

}

var utils = {
	createDiv: function(id) {
		var divItem = document.createElement('div');
		divItem.id = id;
		return divItem;
	},			
	getVideoId: function(link) {
		var video_id = link.split('v=')[1];
		var ampersandPosition = video_id.indexOf('&');
		if(ampersandPosition != -1) {
		  video_id = video_id.substring(0, ampersandPosition);
		}
		return video_id;
	},
	constants: {
		youtubeIframeApiUrl: 'https://www.youtube.com/iframe_api',
		bootstrapUrl: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
		youtubeLinkKey: 'data-youtube-link',
		embeddableKey: 'data-embeddable',
		playingKey: 'data-playing',
		playerClass: 'player',
		playIconClass: 'glyphicon glyphicon-play',
		pauseIconClass: 'glyphicon glyphicon-pause',
		alertIconClass: 'glyphicon glyphicon-alert'
	}
}