Tou.tv plugin for Showtime (Unofficial)
============================

Tou.tv is Radio Canada's TV on demand (replay) website.

Showtime (https://www.lonelycoder.com/showtime ) is a great media center for Linux, Mac OS X and the PS3.

Tou.tv Showtime plugin allows the integration of tou.tv videos into Showtime.

Most of the content is in french, and only accessible from Canada (ip address restriction).

That said, some 'webseries' such as Dakodak or J'adopte un pays, and some other documentaries such as Villages en France can be played from any country (I would say 10% of the shows can be played from outside Canada)


Git: https://github.com/anthonydahanne/showtime-plugin-tou.tv

## Release notes

1.2 - Episode metadata preloading
-  New setting to enable/disable episode metadata preloading (useful if you're outside Canada, to know which content is playable, otherwise slows episodes listing down.)
-  Episode metadata preloading before playing : so that the url is always up to date (it could be outdated before this change)


1.1 - Minor UI fixes
-  After installing, you would get 3 links, only the last one would work to launch the app
-  Emphasizing as much as possible on the fact that most (not all) of the content can only be played from Canada (ip address restriction from tou.tv)

1.0 - First release

-  allows you to browse shows (Emissions), then select one and choose your episode

## Screenshots

![Screenshot](https://raw.github.com/anthonydahanne/showtime-plugin-tou.tv/master/screenshots/tou.tv-homescreen.png "home")
![Screenshot](https://raw.github.com/anthonydahanne/showtime-plugin-tou.tv/master/screenshots/tou.tv-list-of-shows.png "list of shows")
![Screenshot](https://raw.github.com/anthonydahanne/showtime-plugin-tou.tv/master/screenshots/tou.tv-list-of-episodes.png "list of episodes")

## License notes

(c) 2013 Anthony Dahanne [anthony.dahanne@gmail.com](mailto:anthony.dahanne@gmail.com) ; http://blog.dahanne.net


Tou.tv Showtime plugin is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Tou.tv Showtime plugin is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Tou.tv Showtime plugin.  If not, see http://www.gnu.org/licenses/.

## Installing

Tou.tv Showtime plugin, is available directly from Showtime plugin repository. Just install it from there (the puzzle peace in showtime homepage right top corner).

Tou.tv Showtime plugin, *needs* Showtime version >= 4.3.167

- Official versions: https://www.lonelycoder.com/showtime/download

## Infos and special thanks

-  All the browsing will work fine from outside Canada, but the plugin has to call this webservice : http://api.radio-canada.ca/validationMedia/v1/Validation.html?appCode=thePlatform&deviceType=iphone4&connectionType=wifi&idMedia=__EPISODE_PID__&output=json to get the video url (and an associated access ticket) ; and this service will return, for many episodes : {"url":null,"message":"Le contenu sélectionné n\u0027est pas disponible dans votre pays","errorCode":1,"params":null,"bitrates":null} if you don't have a Canadian IP address.
-  Thanks to https://github.com/bvanheu for his answers and for the inspiration (I'm talking  about https://github.com/bvanheu/Tou.tv-console-application/)
-  Thanks to Andreas Öman (https://www.lonelycoder.com/ , author of Showtime) for this great media center and his help and his very rapid implementation of HLS(Http Live Streaming) AES media URLS
