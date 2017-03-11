var MapClass = function () {
    var self = this;
    self.map = null;
    self.location = {
        position: { lat: -34.397, lng: 150.644 },
        name: ''
    };
    self.savedMarkers = ko.observableArray([]);
    self.currentLocation = {};
    self.geocoder = new google.maps.Geocoder();
    self.placesService = null;
    self.searchMarker = null;
    self.infoWindow = new google.maps.InfoWindow();
    self.infoWindowTemplate = null;
};

MapClass.prototype.getLocation = function () {
    var self = this;
    return self.location;
};

MapClass.prototype.setLocation = function (location, notToBeCentered, isCurrentLocation) {
    var self = this;
    self.location = location;
    if (location.name) {
        self.location.name = location.name;
    }

    if (self.map) {
        if (!notToBeCentered) {
            self.map.setCenter(self.location.position);
            if (!isCurrentLocation)
                self.map.setZoom(15);
        }
        if (self.searchMarker) {
            self.searchMarker.setPosition(self.location.position);
        }
        else {
            self.searchMarker = new google.maps.Marker({
                position: self.location.position,
                map: self.map
            });
        }
    }
};

MapClass.prototype.setInfoWindow = function (obj) {
    var self = this;
    self.infoWindow.setContent("");
    self.infoWindow.close();
    if (obj.placeId) {
        self.placesService.getDetails({ placeId: obj.placeId }, function (place, status) {
            if (status === 'OK') {
                infoWindowHelper([place.name, place.vicinity].join(", "));
            }
        });
    }
    else {
        self.getAddresses(obj.lat + ", " + obj.lng).then(function (data) {
            if (data && data.length > 0) {
                self.placesService.getDetails({ placeId: data[0].place_id }, function (place, status) {
                    if (status === 'OK') {
                        infoWindowHelper([place.name, place.vicinity].join(", "));
                    }
                });
            }
        });
    }

    function infoWindowHelper(placeName) {
        self.infoWindow.setContent(self.infoWindowTemplate.replace('%PLACE_NAME%', placeName));
        self.location.name = placeName;
        self.infoWindow.open(self.map, self.searchMarker);
        document.getElementById('add_neighbourhood_link')
            .addEventListener('click', self.addToNeighbourhood.bind(self));
    }
}

MapClass.prototype.getCurrentLocation = function () {
    return new Promise(function (resolve, reject) {
        if (!self.currentLocation) {
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    self.currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(self.currentLocation);
                });
            }
            else {
                reject('GEOLOCATION_CANNOT_BE_ACCESSED');
            }
        }
        else {
            resolve(self.currentLocation);
        }
    });
};

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
};

MapClass.prototype.addToNeighbourhood = function () {
    var self = this;
    var index = self.savedMarkers().findIndex(function (obj) {
        return obj.name === self.location.name;
    });
    if (index === -1) {
        self.savedMarkers.push(self.location);
        localStorage.setItem('neighbourhoods', JSON.stringify(self.savedMarkers()));
    }
};

MapClass.prototype.getNeighbourhoods = function () {
    var self = this;
    return self.savedMarkers();
};

MapClass.prototype.removeNeighbourhood = function(obj) {
    var self = this;
    var index = self.savedMarkers().indexOf(obj);
    if (index !== -1) {
        self.savedMarkers.splice(index, 1);
        localStorage.setItem('neighbourhoods', JSON.stringify(self.savedMarkers()));
    }
}

MapClass.prototype.init = function (elem) {
    var self = this;
    _initObjects();
    _setMap();

    function _initObjects() {
        self.map = new google.maps.Map(elem, {
            center: self.location.position,
            zoom: 18
        });
        var neighbourhoods = localStorage.getItem('neighbourhoods');
        if (neighbourhoods != null) {
            self.savedMarkers(JSON.parse(neighbourhoods));
        }
        self.placesService = new google.maps.places.PlacesService(self.map);
        self.infoWindowTemplate = document.getElementById('info-window-template').textContent;
    }

    function _setMap() {
        self.getCurrentLocation().then(function (data) {
            self.setLocation({ position: data }, false, true);
        }, function (data) {
            console.error(data);
        });

        self.map.addListener('click', function (event) {
            var position = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            };
            self.setLocation({ position }, true);
            if (event.placeId) {
                self.setInfoWindow({ placeId: event.placeId });
            }
            else {
                self.setInfoWindow(position);
            }
            event.stop();
        });
    }
}