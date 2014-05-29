/**
 * Showtime plugin to watch RadioCanada's tou.tv shows
 *
 * Copyright (C) 2013-2014 Anthony Dahanne
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
  var GENRES_URL = "http://api.tou.tv/v1/toutvapiservice.svc/json/GetPageGenre?genre="
  var JSON_OUTPUT = "&output=json";
  var EPISODE_VALIDATION_URL = "http://api.radio-canada.ca/validationMedia/v1/Validation.html?appCode=thePlatform&deviceType=iphone4&connectionType=wifi&idMedia=";
  var CATEGORIEDUREES =  new Array("10 minutes et moins", "26 minutes et moins", "45 minutes et moins", "90 minutes et moins", "Plus de 90 minutes");
  var TOUTV = "Tou.tv";
  // Register a service (will appear on home page)
  var service = plugin.createService("Tou.tv", PLUGIN_PREFIX+"start", "tv", true, plugin.path + "toutv.png");

  // Add a responder to the registered start URI
  plugin.addURI(PLUGIN_PREFIX+"start", function(page) {
    showtime.trace("Getting emissions list : " + EMISSIONS_URL);
    var getEmissionsResponse = showtime.httpGet(EMISSIONS_URL);
    var emissions = showtime.JSONDecode(getEmissionsResponse);

    var totalNumberOfShows = emissions.d.Emissions.length;
    page.type = "directory";
    page.metadata.title = TOUTV + " (" + totalNumberOfShows + " shows)";

    page.appendItem(PLUGIN_PREFIX+"start", "directory", {
        title: "GENRES"
    });
    for each (var genre in emissions.d.Genres) {
      var numberOfShowsPerGenre = 0;
      var listOfShowsPerGenre = "";
      for each (var emission in emissions.d.Emissions) {
        if(emission.Genre == genre.Title) {
          numberOfShowsPerGenre ++;
          listOfShowsPerGenre += emission.Titre + " - ";
        }
      }
      page.appendItem(PLUGIN_PREFIX+"genre:"+genre.Id+":"+genre.Title, "video", {
        title: genre.Title + " (" + numberOfShowsPerGenre +  ")",
        description: listOfShowsPerGenre
      });
    }

    page.appendItem(PLUGIN_PREFIX+"start", "directory", {
        title: "DUREES"
    });
    for each (var duree in CATEGORIEDUREES) {
      var numberOfShowsPerDuree = 0;
      var listOfShowsPerDuree = "";
      for each (var emission in emissions.d.Emissions) {
          if(emission.CategorieDuree == duree) {
            numberOfShowsPerDuree ++;
            listOfShowsPerDuree += emission.Titre + " - ";
          }
        }

      page.appendItem(PLUGIN_PREFIX+"duree:"+duree, "video", {
        title: duree + " (" + numberOfShowsPerDuree +  ")",
        description: listOfShowsPerDuree
      });
    }

    page.appendItem(PLUGIN_PREFIX+"start", "directory", {
        title: "AUTRES"
    });

    var numberOfShowsNotGeoTagged = 0;
    var listOfShowsNotGeoTagged = "";
    for each (var emission in emissions.d.Emissions) {
        if(emission.IsGeolocalise == false) {
          numberOfShowsNotGeoTagged ++;
          listOfShowsNotGeoTagged += emission.Titre + " - ";
        }
      }
    page.appendItem(PLUGIN_PREFIX+"outsidecanada", "video", {
        title: "Accessible Hors Canada" + " (" + numberOfShowsNotGeoTagged +  ")",
        description: listOfShowsNotGeoTagged
    });
    page.appendItem(PLUGIN_PREFIX+"az", "video", {
        title: "A à Z"  + " (" + totalNumberOfShows +  ")"
    });

    page.loading = false;
  });

  function genreMatches(emission, genreTitle) {
    if(emission.Genre == genreTitle) {
      return true;
    }
    return false;
  }

  function dureeMatches(emission, duree) {
    if(emission.CategorieDuree == duree) {
      return true;
    }
    return false;
  }

  function outsideCanadaMatches(emission) {
    if(emission.IsGeolocalise == false) {
      return true;
    }
    return false;
  }

  function aToZMatches(emission) {
    return true;
  }

  function createListing(parameter, page, matchesFunction) {
    showtime.trace("Getting emissions list : " + EMISSIONS_URL);
    var getEmissionsResponse = showtime.httpGet(EMISSIONS_URL);
    var emissions = showtime.JSONDecode(getEmissionsResponse);
    for each (var emission in emissions.d.Emissions) {
      if(matchesFunction(emission, parameter)) {
        if(emission.NombreEpisodes == 1) {
          page.appendItem(PLUGIN_PREFIX+"emission:"+emission.Id+":"+emission.Titre, "video", {
            title: emission.Titre,
            icon: emission.ImageJorC
          });
        } else {
          page.appendItem(PLUGIN_PREFIX+"emission:"+emission.Id+":"+emission.Titre, "directory", {
            title: emission.Titre
          });
        }
      }
    }
    page.loading = false;
  }

  // Add a responder to the registered genre URI
  plugin.addURI(PLUGIN_PREFIX+"genre:(.*):(.*)", function(page,genreId,genreTitle) {
    page.type = "directory";
    page.metadata.title = TOUTV + " " + genreTitle;

    createListing(genreTitle, page, genreMatches);

    // showtime.trace("Getting emissions list for genre " + genreTitle + ": " + GENRES_URL);
    // var getGenreResponse = showtime.httpGet(GENRES_URL + genreId);
    // var genres = showtime.JSONDecode(getGenreResponse);

  });


  // Add a responder to the registered duree URI
  plugin.addURI(PLUGIN_PREFIX+"duree:(.*)", function(page,duree) {
    page.type = "directory";
    page.metadata.title = TOUTV + " " + duree;

    createListing(duree, page, dureeMatches);

  });

    // Add a responder to the registered outsidecanada URI
  plugin.addURI(PLUGIN_PREFIX+"outsidecanada", function(page) {
    page.type = "directory";
    page.metadata.title = TOUTV + " Accessible Hors Canada";

    createListing(null, page, outsideCanadaMatches);

  });

  // Add a responder to the registered az URI
  plugin.addURI(PLUGIN_PREFIX+"az", function(page) {
    page.type = "directory";
    page.metadata.title = TOUTV + " A à Z";

    createListing(null, page, aToZMatches);

  });

  // Add a responder to the registered emission URI
  plugin.addURI(PLUGIN_PREFIX+"emission:(.*):(.*)", function(page,emissionId,title) {
    page.type = "directory";
    page.metadata.title = TOUTV + " " + title;

    showtime.trace("Getting episodes list : " + EPISODES_URL + emissionId);
    var getEpisodesResponse = showtime.httpGet(EPISODES_URL + emissionId);

    var episodes = showtime.JSONDecode(getEpisodesResponse);
    for each (var episode in episodes.d) {
      var displayedTitle = "";
      if (episodes.d.length == 1) {
        displayedTitle = title;
      } else {
        var fullTitle = episode.FullTitle;
        var indexOfColumn = fullTitle.indexOf(":");
        if(indexOfColumn != 0) {
          fullTitle =  fullTitle.substring(indexOfColumn + 1);
        }
        displayedTitle = episode.SeasonAndEpisodeLong + " -" + fullTitle;
      }

      var metadata = {
        title: displayedTitle,
        description: episode.Description,
        year: parseInt(episode.Year),
        duration: episode.LengthString,
        icon: episode.ImagePlayerNormalC
      };
      page.appendItem(PLUGIN_PREFIX + "video:" + episode.PID, "video", metadata);
    }
    page.loading = false;
  });

  // Add a responder to the registered video URI
  plugin.addURI(PLUGIN_PREFIX+"video:(.*)", function(page, pid) {
    // we need to re poll the episode metadata since the pid could be outdated (if the user waited too long)
    showtime.trace("Getting episode metadata before playing : " + EPISODE_VALIDATION_URL + pid + JSON_OUTPUT);
    var getEpisodeResponse = showtime.httpGet(EPISODE_VALIDATION_URL + pid + JSON_OUTPUT);
    var episodeMetadata = showtime.JSONDecode(getEpisodeResponse);
    if(episodeMetadata.url == null ) {
      page.error("You need to be in Canada to play this episode; select 'Accessible Hors Canada' instead");
    } else {
      page.type = 'video';
      page.source = HLS_PREFIX + episodeMetadata.url;
    }
    page.loading = false;
  });

})(this);
