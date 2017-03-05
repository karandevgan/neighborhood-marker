describe("Map", function () {
    var map, currentLocation;
    
    beforeEach(function () {
        map = new MapClass();
    });

    it('should be defined', function () {
        expect(map).toBeDefined();
    });

    it('should be able to get location', function () {
        expect(map.getLocation()).toBeDefined();
    });

    it('should be able to set location', function () {
        var currentLocation = {longitude: 121, latitude: 200};
        map.setLocation(currentLocation)
        expect(map.getLocation()).toBe(currentLocation);
    });
});