function MapViewModel() {
    var self = this;

    // Declare all the private variables here
    var isSearchTextChanged = false;
    var timeout;
    var keyCode = {
        ARROW_DOWN: 'ArrowDown',
        ARROW_UP: 'ArrowUp',
        ARROW_RIGHT: 'ArrowRight',
        ARROW_LEFT: 'ArrowLeft',
        ENTER: 'Enter',
        ESCAPE: 'Escape'
    };
    var currentIndex = -1;
    var prevIndex = -1;
    var searchItemsParent = document.getElementsByClassName('search-results');
    var children = searchItemsParent[0].children;
    var searchInputTextBox = document.getElementById('inputSearch');

    // Declare all the objects here

    self.mapObj = new MapClass();
    self.init = mapObj.init(document.getElementById('map'));
    self.searchText = ko.observable("");
    self.addresses = ko.observable([]);
    self.isResultsPanelActive = ko.observable(true);

    // Declare all the functions here

    self.handleKeyPress = handleKeyPress;
    self.resetSelection = resetSelection;
    self.getAddresses = getAddresses;
    self.setLocation = setLocation;
    self.searchText.subscribe(searchTextSubscription);
    self.areResultsVisible = ko.computed(areResultsVisible);
    self.searchInputClickHandler = searchInputClickHandler;
    self.searchInputBlurHandler = searchInputBlurHandler;

    // Define all the functions here

    function handleKeyPress(data, event) {
        if ((event.key === keyCode.ENTER && self.isResultsPanelActive() === false) ||
            (Object.values(keyCode).indexOf(event.key) === -1 && isSearchTextChanged)) {
            self.addresses([]);
            self.resetSelection();
            self.getAddresses();
            isSearchTextChanged = false;
        }
        else {
            selectChoice(event.key);
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
                    if (data) {
                        self.addresses(data);
                        self.isResultsPanelActive(true);
                    }
                }).catch(function (err) {
                    console.error('Geocode fails due to ' + err);
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
            self.isResultsPanelActive(false);
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
        if (event.key === keyCode.ARROW_DOWN) {
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
        } else if (event.key === keyCode.ARROW_UP) {
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
        } else if (event.key === keyCode.ENTER) {
            if (prevIndex != -1) {
                children[prevIndex].click();
            }
        }
    }

    function searchTextSubscription(value) {
        isSearchTextChanged = true;
    }

    function areResultsVisible() {
        return self.addresses().length > 0 && self.isResultsPanelActive();
    }

    function searchInputClickHandler() {
        searchInputTextBox.classList.add('search-input-focus');
    }

    function searchInputBlurHandler(data, event) {
        self.resetSelection();
        self.isResultsPanelActive(false);
        if (!self.searchText() || self.searchText() === "") {
            searchInputTextBox.classList.remove('search-input-focus');
        }
    }
}

ko.applyBindings(MapViewModel);