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

buildExample(terrainProvider, import.meta.env.MAPBOX_API_TOKEN, {
  lat: 47.13,
  lon: 15.33,
  height: 8000,
});
