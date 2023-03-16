class PlacesAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async getPlaceIdFromLatLng(lat, lng) {
        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${lat},${lng}&inputtype=textquery&fields=place_id&key=${this.apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
        } catch (error) {
            console.log(error)
        }
        return data.candidates[0].place_id;
    }

    async getReviews(placeId) {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${this.apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
        } catch (error) {
            console.log(error)
        }
        return data.result.reviews;
    }
}


//Sample usage:
const apiKey = 'AIzaSyA2ft9Ti0ILphcvqQF3qvHvjY35LOhQxdk';
const placesAPI = new PlacesAPI(apiKey);
var lat = 37.7749;
var lng = -122.4194;

placesAPI.getPlaceIdFromLatLng(lat, lng).then(placeId => {
    placesAPI.getReviews(placeId).then(reviews => {
        console.log(reviews);
    });
});
