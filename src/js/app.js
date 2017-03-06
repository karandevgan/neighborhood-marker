function MapViewModel() {
    var self = this;
    var timeout;
    self.mapObj = new MapClass();
    self.init = mapObj.init(document.getElementById('map'));
    self.searchText = ko.observable("");
    self.addresses = ko.observable([]);
    self.getAddresses = function () {
        if (timeout) {
            clearInterval(timeout);
        }
        if (self.searchText() && self.searchText().length > 2) {
            // Restrict the calls to 500ms debounce
            timeout = setTimeout(function () {
                self.mapObj.getAddresses(self.searchText()).then(function (data) {
                    if (data)
                        self.addresses(data);
                }).catch(function (err) {
                    console.err('Geocode fails due to ' + err);
                });
            }, 500);
        }
        else {
            self.addresses([]);
        }
    };
    self.setLocation = function (address) {
        try {
            self.searchText(address.formatted_address);
            self.addresses([]);
            var location = {
                lat: address.geometry.location.lat(),
                lng: address.geometry.location.lng()
            }
            self.mapObj.setLocation(location);
        }
        catch (err) {
            console.log(err);
        }
    }
}

ko.applyBindings(MapViewModel);