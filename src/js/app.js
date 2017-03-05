var MapClass = function () {
    var self = this;
    self.map = null;
    self.location = {};
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
    }
};

MapClass.prototype.init = function (elem) {
    var self = this;
    self.location = {
        lat: -34.397, lng: 150.644
    }
    self.map = _getMap();

    function _getMap() {
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                self.setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
        return new google.maps.Map(elem, {
            center: self.location,
            zoom: 8
        });
    }
}

function MapViewModel() {
    this.mapObj = new MapClass();
    this.init = mapObj.init(document.getElementById('map'));
}

ko.applyBindings(MapViewModel);