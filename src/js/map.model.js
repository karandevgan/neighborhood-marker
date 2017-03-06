var MapClass = function () {
    var self = this;
    self.map = null;
    self.location = { lat: -34.397, lng: 150.644 };
    self.geocoder = new google.maps.Geocoder();
    self.marker = null;
};

MapClass.prototype.getLocation = function () {
    var self = this;
    return self.location;
};

MapClass.prototype.setLocation = function (location) {
    var self = this;
    self.location = location;
    if (self.map) {
        self.map.setCenter(self.location);
        if (self.marker) {
            self.marker.setPosition(self.location);
        }
        else {
            self.marker = new google.maps.Marker({
                position: self.location,
                map: self.map
            });
        }
    }
};

MapClass.prototype.init = function (elem) {
    var self = this;
    _getMap();
    function _getMap() {
        self.map =  new google.maps.Map(elem, {
            center: self.location,
            zoom: 15
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