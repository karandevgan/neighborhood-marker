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
        var currentLocation = { longitude: 121, latitude: 200 };
        map.setLocation(currentLocation)
        expect(map.getLocation()).toBe(currentLocation);
    });

    describe("Async", function () {
        it('should be able to query the address', function (done) {
            var query = "Hyderabad";
            var address_promise = map.getAddresses(query);
            address_promise.then(function (addresses) {
                expect(addresses).toBeDefined();
                expect(addresses.length > 0).toBeTruthy();
                expect(addresses[0].formatted_address).toContain("Hyderabad");
                expect(addresses[0].formatted_address).toContain("Telangana");
                done();
            });
        });
    });
});