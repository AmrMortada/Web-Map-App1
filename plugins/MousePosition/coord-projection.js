L.Control.coordProjection = L.Control.extend({
  options: {
    position: "bottomright",
    separator: " | ",
    emptyString: " ",
    lngFirst: false,
    numDigits: 6,
    lngFormatter: undefined,
    latFormatter: undefined,
    prefix: "",
    crs: undefined, // Will be auto-detected from map
    crsProjObject: undefined, // Will be auto-detected if using Proj4Leaflet
  },

  onAdd: function (map) {
    this._map = map;

    // Auto-detect CRS from map if not set
    if (!this.options.crs) {
      this.options.crs = map.options.crs.code || "EPSG4326";
    }

    // Auto-detect Proj4Leaflet CRS object
    if (
      typeof L.Proj !== "undefined" &&
      map.options.crs instanceof L.Proj.CRS
    ) {
      this.options.crsProjObject = map.options.crs;
    }

    this._container = L.DomUtil.create(
      "div",
      "leaflet-control-coord-projection"
    );
    L.DomEvent.disableClickPropagation(this._container);
    map.on("mousemove", this._onMouseMove, this);
    this._container.innerHTML = this.options.emptyString;
    return this._container;
  },

  onRemove: function (map) {
    map.off("mousemove", this._onMouseMove, this);
  },

  _onMouseMove: function (e) {
    let projected = this._projectTo(
      this.options.crs,
      e.latlng,
      this.options.crsProjObject
    );

    // Defensive check
    if (
      !projected ||
      typeof projected.x === "undefined" ||
      typeof projected.y === "undefined"
    ) {
      this._container.innerHTML = this.options.emptyString;
      return;
    }

    // Ensure correct lat/lng order
    let position = L.latLng(projected.y, projected.x);

    // Use local variable for precision
    let numDigits =
      this.options.crsProjObject === "EPSG3857" ||
      this.options.crs === "EPSG3857"
        ? 3
        : 6;

    let lng = this.options.lngFormatter
      ? this.options.lngFormatter(position.lng)
      : L.Util.formatNum(position.lng, numDigits);

    let lat = this.options.latFormatter
      ? this.options.latFormatter(position.lat)
      : L.Util.formatNum(position.lat, numDigits);

    let value = this.options.lngFirst
      ? `${lng}${this.options.separator}${lat}`
      : `${lat}${this.options.separator}${lng}`;

    this._container.innerHTML = `${this.options.prefix} ${value}`;
  },

  _projectTo: function (crs, latLng, crsProjObject) {
    if (typeof L.Proj !== "undefined" && crsProjObject instanceof L.Proj.CRS) {
      return crsProjObject.project(latLng);
    }

    switch (crs) {
      case "EPSG3395":
        return L.Projection.Mercator.project(latLng);
      case "EPSG3857":
        return L.Projection.SphericalMercator.project(latLng);
      default: // EPSG4326 or unknown
        return { x: latLng.lng, y: latLng.lat };
    }
  },

  changeCrs: function (crs, crsProjObject) {
    this.options.crs = crs;
    this.options.crsProjObject = crsProjObject;
  },
});

// Add control option to map
L.Map.mergeOptions({
  positionControl: false,
});

// Initialize control if enabled
L.Map.addInitHook(function () {
  if (this.options.positionControl) {
    this.positionControl = new L.Control.coordProjection();
    this.addControl(this.positionControl);
  }
});

// Factory method
L.control.coordProjection = function (options) {
  return new L.Control.coordProjection(options);
};
