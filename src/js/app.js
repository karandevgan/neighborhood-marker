function MapViewModel() {
    var self = this;

    // Declare all the private variables here

    var timeout;
    var keyCode = {
        ARROW_DOWN: 40,
        ARROW_UP: 38,
        ENTER: 13
    };
    var currentIndex = -1;
    var prevIndex = -1;
    var searchItemsParent = document.getElementsByClassName('search-results');
    var children = searchItemsParent[0].children;

    // Declare all the objects here

    self.mapObj = new MapClass();
    self.init = mapObj.init(document.getElementById('map'));
    self.searchText = ko.observable("");
    self.addresses = ko.observable([]);

    // Declare all the functions here

    self.handleKeyPress = handleKeyPress;
    self.resetSelection = resetSelection;
    self.getAddresses = getAddresses;
    self.setLocation = setLocation;

    // Define all the functions here

    function handleKeyPress(data, event) {
        if (event.keyCode != keyCode.ARROW_DOWN && event.keyCode != keyCode.ARROW_UP && event.keyCode != keyCode.ENTER) {
            self.addresses([]);
            self.resetSelection();
            self.getAddresses();
        }
        else {
            selectChoice(event.keyCode);
        }
    }
    
    function resetSelection() {
        currentIndex = -1;
        prevIndex = -1
    }

    function getAddresses() {
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
    }

    function setLocation(address) {
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

    function selectChoice() {
        if (event.keyCode === keyCode.ARROW_DOWN) {
            if (children.length > 0) {
                if (prevIndex != -1) {
                    children[prevIndex].classList.remove('search-item-hover');
                }
                currentIndex = prevIndex + 1;
                if (currentIndex > self.addresses().length - 1)
                    currentIndex = 0;
                children[currentIndex].classList.add('search-item-hover');
                prevIndex = currentIndex;
            }
        } else if (event.keyCode === keyCode.ARROW_UP) {
            if (children.length > 0) {
                if (prevIndex != -1) {
                    children[prevIndex].classList.remove('search-item-hover');
                }
                currentIndex = prevIndex - 1;
                if (currentIndex < 0)
                    currentIndex = self.addresses().length - 1;
                children[currentIndex].classList.add('search-item-hover');
                prevIndex = currentIndex;
            }
        } else if (event.keyCode === keyCode.ENTER) {
            if (prevIndex != -1) {
                children[prevIndex].click();
            }
        }
    }
}

ko.applyBindings(MapViewModel);