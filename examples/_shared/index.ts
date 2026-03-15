import "cesium/Source/Widgets/widgets.css";
import "./main.css";
import * as Cesium from "cesium";

interface CameraLocation {
  lat: number;
  lon: number;
  height?: number;
  pitch?: number;
}

export function buildExample(terrainProvider: any, accessToken?: string, camera?: CameraLocation) {
  const imageryProvider = accessToken
    ? new Cesium.MapboxImageryProvider({
        mapId: "mapbox.satellite",
        maximumLevel: 19,
        accessToken,
      })
    : new Cesium.OpenStreetMapImageryProvider();

  const opts = {
    terrainProvider,
    // @ts-ignore
    skyBox: false as false,
    baseLayerPicker: false,
    geocoder: false,
    skyAtmosphere: false as false,
    animation: false,
    timeline: false,
    // Makes cesium not render high fps all the time
    requestRenderMode: true,
    // Use full scene buffer (respecting pixel ratio) if this is false
    useBrowserRecommendedResolution: false,
    // We have a bug in the tile bounding box calculation somewhere.
    terrainExaggeration: 1.0,
    baseLayer: new Cesium.ImageryLayer(imageryProvider),
  };

  const domID = "cesium-container";
  const g = document.createElement("div");
  g.id = domID;
  document.body.appendChild(g);

  const clat = camera?.lat ?? -21.133786;
  const clon = camera?.lon ?? 14.5481193;

  const viewer = new Cesium.Viewer(domID, opts);

  viewer.extend(Cesium.viewerCesiumInspectorMixin);
  viewer.scene.debugShowFramesPerSecond = true;

  const extent = Cesium.Cartesian3.fromDegrees(clon, clat - 0.3, camera?.height ?? 8000);
  viewer.camera.setView({
    destination: extent,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(camera?.pitch ?? -15),
      roll: 0.0,
    },
  });

  return viewer;
}
