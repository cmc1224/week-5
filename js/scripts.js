// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoiY21jMTIyNCIsImEiOiJjbGc1cWE0aWswNXZzM2ZsaW16cmYzb3BkIn0.6GQ2v6YsggVcqkW-VpgidA';

const NYC_Coordinates = [-73.99863751113894, 40.75334755796155]

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: NYC_Coordinates, // starting position [lng, lat]
    zoom: 13, // starting zoom
    pitch: 0
});

map.addControl(new mapboxgl.NavigationControl());

//locations of 311 complaints
map.on('load', function () {
    map.addSource('RestaurantInspections', {
        type: 'geojson',
        data: RestaurantInspections,
    }),
        map.addSource('Complaints', {
            type: 'geojson',
            data: Complaints,
            cluster: true,
            clusterMaxZoom: 20, // Max zoom to cluster points on
            clusterRadius: 40 // Radius of each cluster when clustering points (defaults to 50)
        })
// Heatmap of violations
    map.addLayer({
        id: 'heatmap-inspections',
        type: 'heatmap',
        source: 'RestaurantInspections',
        maxzoom: 15,
        paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(236,222,239,0)',
                0.2,
                'rgb(208,209,230)',
                0.4,
                'rgb(166,189,219)',
                0.6,
                'rgb(103,169,207)',
                0.8,
                'rgb(28,144,153)'
            ],
            // increase intensity as zoom level increases
            'heatmap-intensity': {
                stops: [
                    [13, 1],
                    [15, 3]
                ]
            },
            'heatmap-opacity': {
                default: 1,
                stops: [
                    [14, 1],
                    [15, 0]
                ]
            },
            'heatmap-radius': {
                stops: [
                    [11, 15],
                    [15, 20]
                ]
            },
        }
    });

//311 Complaints 
        map.addLayer({
            id: 'cluster-complaints',
            type: 'circle',
            source: 'Complaints',
            paint: {
                'circle-color': '#c97fe4',
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    10,
                    10,
                    20,
                    50,
                    30
                ],
                'circle-opacity': 0.6,
            },
        })
//violations as point at restaurant location
    map.addLayer({
        id: 'point-inspections',
        type: 'circle',
        source: 'RestaurantInspections',
        minzoom: 15,
        paint: {
            // Color circle by grade given to restaurant
            'circle-color': [
                'match',
                ['get', 'GRADE'],
                "A",
                '#7bba81',
                "B",
                '#e3cc68',
                "C",
                '#e85d2e',
                '#91756c'
            ],
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            // Transition from heatmap to circle layer by zoom level
            'circle-opacity': 1
        }
//count symbol for clusters
    })
    map.addLayer({
        id: 'cluster-count-complaints',
        type: 'symbol',
        source: 'Complaints',
        layout: {
            'text-field': ['get', 'point_count'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-allow-overlap': true,
        },
        paint: {
            'text-color': '#0a0a0a'
        }
    });

//setting popup and content
    map.on('click', 'point-inspections', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `<div>
                    <h3>
                        ${e.features[0].properties.DBA}
                    </h3>
                    <p>
                    On ${e.features[0].properties['inspection-date']}, This restaurant was cited with the 
                    following violation: ${e.features[0].properties['violation-description']}
                    </p >
                </div> `
            )
            .addTo(map);
    });

})