//----------------------------Load map container-----------------------//
// const homeLatLng = [10.271681, 37.397461];
const homeLatLng = [27.00663, 31.24967];
const homeZoom = 6;
const myMinZoom = 1;
const myMaxZoom = 19;

let myMap = L.map("myMap", {
  zoom: homeZoom,
  zoomDelta: 0.25,
  zoomSnap: 0,
  center: homeLatLng,
  attributionControl: false,
  zoomControl: false,
});
const mainDiv = document.querySelector("#myMap");
//----------------------------search on map--------------------------//
const provider = new window.GeoSearch.OpenStreetMapProvider({
  params: {
    "accept-language": "AR", // render results in Arabic
    // countrycodes: "EG", // limit search results to Egypt
    addressdetails: 1, // include additional address detail parts
  },
});

const search = new window.GeoSearch.GeoSearchControl({
  position: "topleft",
  notFoundMessage: "Sorry, that address could not be found.",
  provider: provider,
  style: "button",
  showMarker: true, // Show marker at result location
  showPopup: true, // Show popup with result label
  retainZoomLevel: false, // Keep current zoom level after search
  animateZoom: true, // Animate zoom to result
  autoComplete: true,
  autoClose: true, // Close results after selection
  searchLabel: "Enter Address", // Placeholder text
  maxSuggestions: 5, // Limit number of suggestions shown.
  keepResult: true, // Keep result visible after new search
  updateMap: true, // Automatically pan/zoom to result
  marker: {
    icon: new L.Icon.Default(), // Customize marker icon
    draggable: false, // Allow user to drag marker
  },
});

myMap.addControl(search);
//----------------------------Load tile map--------------------------//
let Stadia_Satellite = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}",
  {
    minZoom: myMinZoom,
    maxZoom: myMaxZoom,
    attribution:
      '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "jpg",
  }
);

let OSM = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  minZoom: myMinZoom,
  maxZoom: myMaxZoom,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

let Esri_WorldImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    minZoom: myMinZoom,
    maxZoom: 19,
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

let Google_Maps = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    minZoom: myMinZoom,
    maxZoom: myMaxZoom,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

let baseMap = {
  OpenStreetMap: OSM,
  "Esri Imagery": Esri_WorldImagery,
  "Google Maps": Google_Maps,
  "Stadia Satellite": Stadia_Satellite,
};

///--------> Adding basemap to the app
let layerControl = L.control.layers(baseMap).addTo(myMap);
if (!localStorage.getItem("baseMap")) {
  localStorage.setItem("baseMap", "OpenStreetMap");
}

let storedBaseMap = localStorage.getItem("baseMap");
if (storedBaseMap && storedBaseMap.trim()) {
  baseMap[storedBaseMap.trim()].addTo(myMap);
} else {
  baseMap.OpenStreetMap.addTo(myMap);
}
///--------> locat storage for basemap
let mapElemt = document.querySelector(
  ".leaflet-control-layers-list .leaflet-control-layers-base"
);
mapElemt.addEventListener("change", () => {
  for (let i = 0; i < mapElemt.childNodes.length; i++) {
    if (mapElemt.childNodes[i].childNodes[0].childNodes[0].checked) {
      localStorage.setItem(
        "baseMap",
        mapElemt.childNodes[i].childNodes[0].childNodes[1].textContent
      );
    }
  }
});

//////////////////////////Map Controls/////////////////////////////////

//----------------------------Home button----------------------------//
const homeControl = L.Control.extend({
  options: {
    position: "topleft",
  },
  onAdd: () => {
    const container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-control leaflet-control-custom"
    );
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    const button = L.DomUtil.create("a", "", container);
    button.href = "#";
    button.innerHTML =
      '<img src="/plugins/images/home.png" alt="Home" style="height:16px; margin-top: 7px;">';
    button.title = "Home";
    L.DomEvent.on(button, "click", (e) => {
      myMap.flyTo(homeLatLng, homeZoom);
    });
    return container;
  },
});
myMap.addControl(new homeControl());

//----------------------------zoom of map----------------------------//
L.control
  .zoom({
    position: "topleft",
    zoomInText: "<div style='font-size: 0.95em;'>+</div>",
    zoomOutText: "<div style='font-size: 0.95em;'>-</div>",
  })
  .addTo(myMap);

//----------------------------scale of map----------------------------//
L.control
  .scale({
    imperial: false,
    maxWidth: 150,
  })
  .addTo(myMap);

//----------------------------measure of map----------------------------//
L.control;
myMap.addControl(
  new L.Control.LinearMeasurement({
    position: "topleft",
    unitSystem: "metric",
    color: "#2A93EE",
    fillColor: "#fff",
  })
);

//---------------------------mouse loc of map--------------------------//
let mouseCoord = L.control
  .coordProjection({
    // crs: "EPSG3857",
    lngFirst: false,
    latFormatter: function (lat) {
      if (mouseCoord.options.crs === "EPSG3857") {
        return "<b>Northing: </b>" + lat.toFixed(3) + " m";
      } else {
        const direction = lat >= 0 ? "N" : "S";
        return "<b>Lat: </b>" + lat.toFixed(6) + "° " + direction;
      }
    },
    lngFormatter: function (lng) {
      if (mouseCoord.options.crs === "EPSG3857") {
        return "<b>Easting: </b>" + lng.toFixed(3) + " m";
      } else {
        const direction = lng >= 0 ? "E" : "W";
        return "<b>Long: </b>" + lng.toFixed(6) + "° " + direction;
      }
    },
  })
  .addTo(myMap);

//---------------------------Draw map--------------------------//
myMap.pm.addControls({
  position: "topright",
  drawCircleMarker: false,
  rotateMode: false,
  drawText: false,
  cutPolygon: false,
});

//---------------------------Mini map--------------------------//
let Esri_Mini = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    minZoom: 0,
    maxZoom: 15,
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

let miniMap = new L.Control.MiniMap(Esri_Mini, {
  zoomLevelOffset: -4,
  width: 200,
  height: 200,
  toggleDisplay: true,
  minimized: true,
}).addTo(myMap);

//-----------------------Full Screen map-----------------------//
myMap.addControl(
  new L.Control.Fullscreen({
    position: "bottomleft",
    title: {
      false: "View Fullscreen",
      true: "Exit Fullscreen",
    },
  })
);

//-----------------------Location on map-----------------------//
L.control
  .locate({
    position: "bottomleft",
    setView: "untilPanOrZoom",
    // initialZoomLevel: homeZoom,
    flyTo: true,
    strings: {
      title: "Find my location",
      popup: "You are within {distance} {unit} from this point", //--> Popup message
      metersUnit: "meters",
      feetUnit: "feet",
      outsideMapBoundsMsg: "You seem located outside the map bounds",
    },
    locateOptions: {
      maxZoom: 19,
      watch: true,
      enableHighAccuracy: true,
    },
  })
  .addTo(myMap);

//-----------------------history view on map-----------------------//
new L.HistoryControl({
  position: "topleft",
  maxMovesToSave: 20,
  orientation: "vertical",
}).addTo(myMap);

//-----------------------upload data on map-----------------------//
let myStyle = {
  color: "#ff7800",
  weight: 5,
  opacity: 0.65,
};

function nwStyle(geoJson, latlng) {
  console.log(geoJson);
  console.log(latlng);
  return L.marker(latlng);
}

const control = L.control
  .betterFileLayer({
    addToMap: true,
    clearOnNewUpload: true,
    dragAndDrop: true,
    pane: "overlayPane",
    zIndex: 500,
    importOptions: {
      csv: {
        delimiter: ",",
        latfield: "lat",
        longfield: "long",
      },
    },
    extensions: [
      ".geojson",
      ".json",
      ".kml",
      ".kmz",
      ".wkt",
      ".csv",
      ".topojson",
      ".polyline",
      ".zip",
      ".shp",
      ".shx",
      ".dbf",
      ".prj",
    ],
    fileSizeLimit: 1024, // ==> KB
    // style: myStyle,
    fileSizeLimitMessage: (size) => {
      const sizeMB = (size / 1024).toFixed(2);
      return `🚫 File is too large: ${sizeMB} MB (limit is ${(
        control.options.fileSizeLimit / 1000
      ).toFixed(0)} MB)`;
    },

    fileTypeErrorMessage: (ext) => {
      return `❌ <b>.${ext}</b> format is not supported.`;
    },
    onEachFeature: function popupStyle(feature, layer) {
      if (feature.properties) {
        const props = feature.properties;
        const geom = feature.geometry;
        let popupContent = '<table class="info-table">';
        popupContent += `<tbody>`;
        for (let key in props) {
          popupContent += `<tr>`;
          popupContent += `<th><input type="text" value="${key}" readonly></th>`;
          popupContent += `<td><input type="text" value="${props[key]}"></td>`;
          popupContent += `</tr>`;
        }
        if (geom.type === "Point") {
          popupContent += `<tr>`;
          popupContent += `<th><input type="text" value="Lat"></th>`;
          popupContent += `<td><input type="text" value="${geom.coordinates[1].toFixed(
            6
          )}"></td>`;
          popupContent += `</tr>`;
          popupContent += `<tr>`;
          popupContent += `<th><input type="text" value="Long"></th>`;
          popupContent += `<td><input type="text" value="${geom.coordinates[0].toFixed(
            6
          )}"></td>`;
          popupContent += `</tr>`;
        }
        popupContent += `</tbody>`;
        popupContent += "</table>";

        layer.bindPopup(popupContent);
      } else {
        layer.bindPopup("No properties available.");
      }
    },
  })
  .addTo(myMap);

const fileInput = document.querySelector('div input[type="file"]');
fileInput.addEventListener("change", () => {
  setTimeout(() => {
    fileInput.value = "";
  }, 100);
});

///////////////////////////////
//---> Plugins Events
// Handle unsupport format file
myMap.on("bfl:filenotsupported", (ev) => {
  const featureDiv = L.DomUtil.create("div", "unsupptFeat");
  featureDiv.innerHTML = control.options.fileTypeErrorMessage(ev.fileExtension);
  mainDiv.prepend(featureDiv);
  setTimeout(() => featureDiv.remove(), 5000);
});

// Handle add feature layers
myMap.on("bfl:layerloaded", (ev) => {
  if (control.options.extensions.includes("." + ev.fileExtension)) {
    layerControl.addOverlay(ev.layer, ev.layer.options.name);
    let labels = document.querySelectorAll(
      ".leaflet-control-layers-overlays label"
    );
    labels.forEach((label) => {
      label.className = "overLy";
      label.style.cssText =
        "display: flex; align-content: space-between; justify-content: space-between; flex-wrap: nowrap;flex-direction: row;";
      let menuBtn = document.createElement("button");
      menuBtn.title = "Menu";
      let layerNm = label.querySelector(".overLy span");
      layerNm.style.cssText =
        "display: inline-block;width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align:";
      menuBtn.innerHTML = "🔍";
      menuBtn.style.cssText =
        "border: none; cursor: pointer; background-color: #ffffff00;";
      label.appendChild(menuBtn);
      // mini menu of layers
      menuBtn.addEventListener("click", (e) => {
        for (let i in layerControl._layers) {
          if (
            layerControl._layers[i].name ===
            menuBtn.previousElementSibling.children[1].textContent.trim()
          ) {
            myMap.fitBounds(layerControl._layers[i].layer.getBounds());
          }
        }
      });
    });
    myMap.fitBounds(ev.layer.getBounds());
    let featureDiv = L.DomUtil.create("div", "featNumb");
    featureDiv.innerHTML =
      "Imported " + Object.keys(ev.layer._layers).length + " features.";
    mainDiv.prepend(featureDiv);
    setTimeout(() => featureDiv.remove(), 4000);
  } else {
    myMap.fire("bfl:filenotsupported", { fileExtension: ev.fileExtension });
  }
});

// Handle parsing errors
myMap.on("bfl:layerloaderror", (ev) => {
  const featureDiv = L.DomUtil.create("div", "sizeLimit");
  featureDiv.innerHTML = `❌ Error loading layer: ${ev.fileName}`;
  mainDiv.prepend(featureDiv);
  setTimeout(() => featureDiv.remove(), 5000);
});

// Handle size limit
myMap.on("bfl:filesizelimit", (ev) => {
  const featureDiv = L.DomUtil.create("div", "sizeLimit");
  featureDiv.innerHTML = control.options.fileSizeLimitMessage(ev.fileSize);
  mainDiv.prepend(featureDiv);
  setTimeout(() => featureDiv.remove(), 5000);
});

// Handle missing coordinate errors
myMap.on("bfl:layerisempty", (ev) => {
  const featureDiv = L.DomUtil.create("div", "emptyCoord");
  featureDiv.innerHTML = `⚠️ "<b>${ev.fileName}</b>" has no spatial data detected. Coordinate fields must be named <b>lat</b> and <b>long</b>.`;
  mainDiv.prepend(featureDiv);
  setTimeout(() => featureDiv.remove(), 5000);
});

