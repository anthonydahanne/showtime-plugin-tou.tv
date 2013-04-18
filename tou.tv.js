/**
 * Showtime plugin to watch RadioCanada's tou.tv shows
 *
 * Copyright (C) 2013 Anthony Dahanne
 *
 *     This file is part of Tou.tv Showtime plugin.
 *
 *  Tou.tv Showtime plugin is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Tou.tv Showtime plugin is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Tou.tv Showtime plugin.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  Download from : https://github.com/anthonydahanne/showtime-plugin-tou.tv
 *
 */

(function(plugin) {

  var PLUGIN_PREFIX = "tou.tv:";
  var HLS_PREFIX = "hls:";
  var EMISSIONS_URL = "http:/api.tou.tv/v1/toutvapiservice.svc/json/GetPageRepertoire";
  var EPISODES_URL = "https://api.tou.tv/v1/toutvapiservice.svc/json/GetEpisodesForEmission?emissionid=";
  var JSON_OUTPUT = "&output=json";
  var EPISODE_VALIDATION_URL = "http://api.radio-canada.ca/validationMedia/v1/Validation.html?appCode=thePlatform&deviceType=iphone4&connectionType=wifi&idMedia=";

  // Register a service (will appear on home page)
  var service = plugin.createService("Tou.tv", PLUGIN_PREFIX+"start", "tv", true, plugin.path + "toutv.png");

  // register the settings
  var settings = plugin.createSettings("Tou.tv",
    plugin.path + "toutv.png",
    "Showtime plugin to watch RadioCanada's Tou.tv shows (Unofficial)");

  settings.createInfo("info",
    plugin.path + "toutv.png",
    "\n"+
      "Tou.tv Showtime plugin is the integration of the website tou.tv into Showtime.\n" +
      "Most of the content is in french, and only accessible from Canada (ip address restriction).\n"+
      "That said, some 'webseries' such as Dakodak or J'adopte un pays, "+
      "and some other documentaries such as Villages en France can be played from any country "+
      "(I would say 10% of the shows can be played from outside Canada)\n\n"+
      "Disable episodes metadata preloading if you are located in Canada; episodes list loading will be faster (if you are not located in Canada, let it enabled; episodes listing will be slower but at least you'll know whether you can play the episodes or not !\n");

  settings.createBool("disableEpisodesMetadataPreloading", "Disable episodes metadata preloading", false, function(v) {
    service.disableEpisodesMetadataPreloading = v;
  });


  // Add a responder to the registered start URI
  plugin.addURI(PLUGIN_PREFIX+"start", function(page) {
    page.type = "directory";
    page.metadata.title = "Tou.tv shows";

    showtime.trace("Getting emissions list : " + EMISSIONS_URL);
    var getEmissionsResponse = showtime.httpGet(EMISSIONS_URL);
    var emissions = showtime.JSONDecode(getEmissionsResponse);

    for each (var emission in emissions.d.Emissions) {
      page.appendItem(PLUGIN_PREFIX+"emission:"+emission.Id+":"+emission.Titre, "directory", {
        title: emission.Titre
      });
    }

    page.loading = false;
  });

  // Add a responder to the registered emission URI
  plugin.addURI(PLUGIN_PREFIX+"emission:(.*):(.*)", function(page,emissionId,title) {
    page.type = "directory";
    page.metadata.title = title;

    showtime.trace("Getting episodes list : " + EPISODES_URL + emissionId);
    var getEpisodesResponse = showtime.httpGet(EPISODES_URL + emissionId);

    var episodes = showtime.JSONDecode(getEpisodesResponse);
    for each (var episode in episodes.d) {
      var problemTitle = "";
      var problemDescription = "";
      // we don't try to load all the episodes' metadata if the user disabled the setting
      if(service.disableEpisodesMetadataPreloading == 0) {
        showtime.trace("Getting episode metadata to check availability : " + EPISODE_VALIDATION_URL + episode.PID + JSON_OUTPUT);
        var getEpisodeResponse = showtime.httpGet(EPISODE_VALIDATION_URL + episode.PID + JSON_OUTPUT);
        var episodeMetadata = showtime.JSONDecode(getEpisodeResponse);

        if(episodeMetadata.url==null && episodeMetadata.errorCode==1) {
          problemTitle = " - THIS EPISODE CAN'T BE PLAYED";
          problemDescription = "THIS EPISODE CAN'T BE PLAYED FROM YOUR COUNTRY DUE TO IP ADDRESS RESTRICTIONS\u000A(Most probably this content is only available for Canadians)\u000A\u000A";
        }
      }

      var metadata = {
        title: episode.SeasonAndEpisodeLong + problemTitle,
        description: problemDescription + episode.Description,
        year: parseInt(episode.Year),
        duration: episode.LengthString,
        icon: episode.ImagePlayerNormalC
      };
      page.appendItem(PLUGIN_PREFIX + "video:" + episode.PID, "video", metadata);
    }
    page.loading = false;
  });

  plugin.addURI(PLUGIN_PREFIX+"video:(.*)", function(page, pid) {
    // we need to re poll the episode metadata since the pid could be outdated (if the user waited too long)
    showtime.trace("Getting episode metadata before playing : " + EPISODE_VALIDATION_URL + pid + JSON_OUTPUT);
    var getEpisodeResponse = showtime.httpGet(EPISODE_VALIDATION_URL + pid + JSON_OUTPUT);
    var episodeMetadata = showtime.JSONDecode(getEpisodeResponse);
    if(episodeMetadata.url == null ) {
      page.error("Because you are not located in Canada, you can't play this episode; see settings");
    } else {
      page.type = 'video';
      page.source = HLS_PREFIX + episodeMetadata.url;
    }
    page.loading = false;
  });

})(this);
