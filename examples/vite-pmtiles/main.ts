import * as Cesium from "cesium";
import {
  MartiniTerrainProvider,
  PMTilesHeightmapResource,
  WorkerFarmTerrainDecoder,
} from "../..";
import { buildExample } from "../_shared";

const terrariumWorker = new Worker(
  new URL("./terrarium.worker", import.meta.url),
  { type: "module" },
);

// Mapterhorn Terrarium-encoded elevation tiles via PMTiles
const terrainResource = new PMTilesHeightmapResource({
  url: "https://download.mapterhorn.com/planet.pmtiles",
  tileSize: 512,
  maxZoom: 12,
  skipZoomLevels(z: number) {
    return z % 3 != 0
  },
});

// Terrarium format uses a different encoding scheme to Mapbox Terrain-RGB
// @ts-ignore
const terrainDecoder = new WorkerFarmTerrainDecoder({
  worker: terrariumWorker,
});

// Construct terrain provider with Mapterhorn PMTiles datasource and Terrarium RGB decoding
// @ts-ignore
const terrainProvider = new MartiniTerrainProvider({
  resource: terrainResource,
  decoder: terrainDecoder,
});

// VersaTiles: free, unauthenticated satellite imagery (Copernicus Sentinel-2)
const imageryProvider = new Cesium.UrlTemplateImageryProvider({
  url: "https://tiles.versatiles.org/tiles/satellite/{z}/{x}/{y}",
  maximumLevel: 12,
  credit: new Cesium.Credit("© Copernicus Sentinel-2 via VersaTiles", true),
});

buildExample(
  terrainProvider,
  undefined,
  {
    lat: 47.13,
    lon: 15.33,
    height: 8000,
  },
  imageryProvider,
);
