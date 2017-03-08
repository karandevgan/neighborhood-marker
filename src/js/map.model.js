var MapClass = function () {
    var self = this;
    self.map = null;
    self.location = { lat: -34.397, lng: 150.644 };
    self.geocoder = new google.maps.Geocoder();
    self.placesService = null;
    self.searchMarker = null;
    self.infoWindow = new google.maps.InfoWindow;
};

MapClass.prototype.getLocation = function () {
    var self = this;
    return self.location;
};

MapClass.prototype.setLocation = function (location, notToBeCentered) {
    var self = this;
    self.location = location;
    if (self.map) {
        if (!notToBeCentered) {
            self.map.setCenter(self.location);
        }
        if (self.searchMarker) {
            self.searchMarker.setPosition(self.location);
        }
        else {
            self.searchMarker = new google.maps.Marker({
                position: self.location,
                map: self.map
            });
        }
    }
};

MapClass.prototype.init = function (elem) {
    var self = this;
    _setMap();
    function _setMap() {
        self.map = new google.maps.Map(elem, {
            center: self.location,
            zoom: 15
        });

        self.placesService = new google.maps.places.PlacesService(self.map);

        self.map.addListener('click', function (event) {
            self.setLocation(event.latLng, true);
            self.infoWindow.setContent("");
            self.infoWindow.close();
            if (event.placeId) {
                self.placesService.getDetails({ placeId: event.placeId }, function (place, status) {
                    if (status === 'OK') {
                        self.infoWindow.setContent(place.name);
                        self.infoWindow.open(self.map, self.searchMarker);
                    }
                });
                self.infoWindow.setPosition(event.latLng);
            }
            event.stop();
        });

        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                self.setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
    }
}

MapClass.prototype.getAddresses = function (query) {
    var self = this;
    var addressPromise = new Promise(function (resolve, reject) {
        self.geocoder.geocode({ 'address': query }, function (results, status) {
            if (status === 'OK') {
                resolve(results);
            }
            else {
                reject(status);
            }
        });
    });
    return addressPromise;
}