function addEdificiosCapa() {

    map.addSource("edificis_source", {
        "type": "vector",
        "url": "mapbox://mamoure.6qabem19"  // Afegir el nostre Tileset ID

    });

    map.addLayer({
        "id": "edificis",
        "type": "fill-extrusion", // Volem visualitzar alçades
        "source": "edificis_source", // Source creat anteriorment
        "source-layer": "construccions-9cjnpk", // Afegir el nom del Tileset (nom de la capa que volem visualitzar)
        "maxzoom": 24,
        "minzoom": 15,
        "filter": [">", "numberOfFloorsAboveGround", 0], // Només mostra els valors del camp numberOfFloorsAboveGround que siguin més grans que 0. És a dir, mostra només edificis d'1 planta o més.
        "paint": {
            "fill-extrusion-color": [
                "interpolate", ["linear"], ["number", ["get", "numberOfFloorsAboveGround"]],
                /*
                Sabent màxims i mínims, interpolem. És a dir, agafem camp numberOfFloorsAboveGround (que el podem consultar a la descripció de la capa a Mapbox)
                i posteriorment assignem un rang de valors com si fos la llegenda d'un mapa. Estem dient: 0 plantes color blanc, 1 planta color #e6b03d,
                3 plantes color #e6b03d, 6 plantes color #3de66d. El que és interessant de tot això és que els valors de plantes que ens quedin entremig,
                es visualitzaran amb un color graduat: per exemple, edifici de 5 plantes es veurà entre #e6b03d", (3 plantes) i "#3de66d" (6 plantes)
                */
                0,   "#FFFFFF",
                1,   "#e6b03d",
                3,   "#e6b03d",
                6,   "#3de66d",
                9,   "#3de6b1",
                12,  "#22ecf0",
                15,  "#14b1fd",
                20,  "#3d73e6",
                40,  "#123a8f",
                60,  "#ce2f7e",
                106, "#ff4d4d"

            ],
            "fill-extrusion-height": [ // Estilitzem l'alçada quan fem zoom. Quant més zoom fem, més falsegem l'alçada de l'edifici fent-la més gran.
                "interpolate",
                ["linear"],
                ["zoom"],
                8, 0,
                12.5, 0,
                14, ["*", 1,   ["to-number", ["get", "numberOfFloorsAboveGround"] ]], // Exagerem l'estil de l'alçada
                16, ["*", 1.5, ["to-number", ["get", "numberOfFloorsAboveGround"] ]], // Quanta més alçada, més exagerem (Edificis de 20 plantes multipliquem per 2, de 16 plantes per 1,5)
                20, ["*", 2,   ["to-number", ["get", "numberOfFloorsAboveGround"] ]]
            ],
            "fill-extrusion-opacity": 0.9
        }
    }, "road-label"); // Afegim aquest "road-label" per canviar l'ordre de visualització de les capes, és a dir, volem que els noms dels carrers ens quedin per sobre dels edificis per tal que es puguin llegir.
    // fin addLayer capa texto "water-name-lakeline-platja", "road-label"
}
// Els edificis que ens apareixen en negre és perquè les dades són errònies (numberOfFloorsAboveGround:true). Aquest "true" hauria de ser un valor numèric
// Els edificis en blanc és perquè numberOfFloorsAboveGround és igual a zero. Amb el filter podem evitar aquests 2 colors.


function addPopupToMapEdificis2(nomCapa) {
    map.on('click', nomCapa, function (e) {
        var text = "";
        //console.info(e);
        for (key in e.features[0].properties) { // Recorrem totes les propietats de la capa
            if (key == "numberOfFloorsAboveGround") { // Li estem dient que només ens mostri al popup la propietat "numberOfFloorsAboveGround", que és la que té la informació de les plantes de l'edifici. Si volem mostrar tota la info, treure el "if"
                text += "<b>Número de plantes</b>: " + e.features[0].properties[key] + "<br>";
            }
        }
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(text)
            .addTo(map);
    });

    map.on('mouseenter', nomCapa, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', nomCapa, function () {
        map.getCanvas().style.cursor = '';
    });
}

function filtrarEdificis(valor) { // Cridarem a aquesta funció cada cop que movem l'slider (amb un event). Valor serà la dada de l'slider. Filtrarem per número de plantes.
    map.setFilter("edificis", [">", "numberOfFloorsAboveGround", parseInt(valor)]);
    document.getElementById("altura").innerHTML = "Altura superior a " + valor + " plantes."; // Actualitzem la dada al text.
}

function activarEdificis(activo) {
    // Dues opcions: visible o none
    if (activo) { // Si el checkbox ha estat clicat, el valor de "activo" sera "true" i entrarem dins de la condició
        map.setLayoutProperty("edificis", "visibility", "visible"); // Enviem un "visible" per indicar que es mostri la capa
    }
    else {
        map.setLayoutProperty("edificis", "visibility", "none"); // Si el valor de "activo" es "false", enviem un "none" per indicar que NO es mostri la capa
    }
}

function addPopupToMapEdificios(nombreCapa) {

    map.on('click', nombreCapa, function (e) {

        var text = "";
        //console.info(e);
        for (key in e.features[0].properties) {

            if (key == "numberOfFloorsAboveGround") {
                text += "<b>Numero de plantas</b>:" + e.features[0].properties[key] + "<br>";
            }
            if (key == "localId") {
                //localId 0004702DF3800C_part1
                //http://ovc.catastro.meh.es/OVCServWeb/OVCWcfLibres/OVCFotoFachada.svc/RecuperarFotoFachadaGet?ReferenciaCatastral=0004701DF3800C
                //https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCListaBienes.aspx?rc1=0004701&rc2=DF3800C

                var localId = e.features[0].properties[key];

                var localIdSplit = localId.split("_"); // 0004702DF3800C  part1
                var parte1 = localIdSplit[0].substring(0, 7);
                var parte2 = localIdSplit[0].substring(7, localIdSplit[0].length);
                text += "<img width=200 src=http://ovc.catastro.meh.es/OVCServWeb/OVCWcfLibres/OVCFotoFachada.svc/RecuperarFotoFachadaGet?ReferenciaCatastral=" + localId + "><br>";
                text += "<a target=blank href=https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCListaBienes.aspx?rc1=" + parte1 + "&rc2=" + parte2 + ">Ficha</a><br>";

            }


        }
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(text)
            .addTo(map);

    });

    map.on('mouseenter', nombreCapa, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', nombreCapa, function () {
        map.getCanvas().style.cursor = '';
    });

}