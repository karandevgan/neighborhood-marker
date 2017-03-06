function MapViewModel() {
    this.mapObj = new MapClass();
    this.init = mapObj.init(document.getElementById('map'));
}

ko.applyBindings(MapViewModel);