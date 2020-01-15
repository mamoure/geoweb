//Creamos una función para convertir la respuesta de JSON GeoNames al formato GeoJSON
function terremotosGeonamesToGeoJSON(respuestaGeonames){
    //Variable geojson vacía
    var geoJSON ={
        "type": "FeatureCollection",
        "features": []
    };
    //Es un bucle: cada parámetro se va completando con las respuestas del servidor
    for (var i =0; i < respuestaGeonames.earthquakes.length; i++){

        geoJSON.features.push(
            {
                "type": "Feature",
                "properties": {"magnitude":respuestaGeonames.earthquakes[i].magnitude,
                                "datetime":respuestaGeonames.earthquakes[i].datetime },
                "geometry": {
                  "type": "Point",
                  "coordinates": [
                    respuestaGeonames.earthquakes[i].lng,
                    respuestaGeonames.earthquakes[i].lat
                  ]
                }
              }
        );

    } //fin loop

    return geoJSON;

    } //fin funcion

//Función para capturar las coordenadas del mapa
//Enviar peticion a geonames, convierte la respuesta a formato geojson
function generarPeticionTerremotos() {

    //var mg =5;
    //if (map.getZoom()>8{
        //mg=3;
    //}   

    //Variable que concatena parámetros
    var peticion = 'http://api.geonames.org/earthquakesJSON?' +
        'north=' + map.getBounds()._ne.lat + '&' +
        'south=' + map.getBounds()._sw.lat + '&' +
        'east=' + map.getBounds()._ne.lng + '&' +
        'west=' + map.getBounds()._sw.lng + '&' +
        'maxRows=50&' +
        //Filtro a partir del cual mostrar terremotos. Si quiero añadir filtro creo variable mg=5;
        //Y aquí: 'minMagnitude='+ mg + '&'
        'minMagnitude=5&' +
        'username=masterupc&';

    //Llamar a una función asíncrona: funcion.then y da una respuesta de geonames
    enviarPeticion(peticion).then(function (respuestaGeonames) {

        var geoJSON = terremotosGeonamesToGeoJSON(respuestaGeonames);

        //Método para ver si existe un source
        if (map.getSource("terremotos_source")) {

            map.getSource("terremotos_source").setData(geoJSON);

        } else {

            map.addSource("terremotos_source", {
                type: "geojson",
                data: geoJSON
            });

            //Para estilizar varibale y convertirla en círculos
            map.addLayer({
                'id': 'terremotos',
                'type': 'circle',
                'source': 'terremotos_source',
                'paint': {
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'magnitude'],
                        //Tematizar variables: para cada variable un color, para variable intermedia color resultante de una interpolación
                        3, '#ebe709',
                        5, '#eb1809',
                        7, '#ef4bf2',
                    ],
                    'circle-opacity': 0.75,
                    'circle-radius': [
                        'interpolate',
                        ['linear'], ['get', 'magnitude'],
                        3, 8,
                        5, 16,
                        8, 32
                    ]
                }
            });

            //Para estilizar variable y convertirla en texto
            map.addLayer({
                'id': 'terremotos-textos',
                'type': 'symbol',
                'source': 'terremotos_source',
                'layout': {
                    'text-field': [                            
                        'format', ['get', 'magnitude'],                               
                    ],
                    "text-font": [
                        "FiraSans-Italic"
                    ],
                    'text-size': 10
                },
                'paint': {
                    'text-color': 'rgba(0,0,0,1)'
                }
            });

        }

    });

} // fin funcion
    