import { Credit } from "cesium";
import { PMTiles } from "pmtiles";
import { TileCoordinates } from "../terrain-data";
import { HeightmapResource } from "./heightmap-resource";

interface CanvasRef {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

export interface PMTilesHeightmapResourceOpts {
  url: string;
  credit?: Credit;
  tileSize?: number;
  maxZoom?: number;
  skipZoomLevels?: [number] | ((z: number) => boolean);
}

export class PMTilesHeightmapResource implements HeightmapResource {
  credit?: Credit;
  tileSize: number;
  maxZoom: number;
  skipZoomLevel: (z: number) => boolean;
  private pmtiles: PMTiles;
  private contextQueue: CanvasRef[];

  constructor(opts: PMTilesHeightmapResourceOpts) {
    this.pmtiles = new PMTiles(opts.url);
    this.credit = opts.credit;
    this.tileSize = opts.tileSize ?? 512;
    this.maxZoom = opts.maxZoom ?? 12;
    this.contextQueue = [];

    if (opts.skipZoomLevels) {
      if (Array.isArray(opts.skipZoomLevels)) {
        const levels = opts.skipZoomLevels as [number];
        this.skipZoomLevel = (z: number) => levels.includes(z);
      } else {
        this.skipZoomLevel = opts.skipZoomLevels;
      }
    } else {
      this.skipZoomLevel = () => false;
    }
  }

  private getCanvas(): CanvasRef {
    let ctx = this.contextQueue.pop();
    if (ctx == null) {
      const canvas = document.createElement("canvas");
      canvas.width = this.tileSize;
      canvas.height = this.tileSize;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      ctx = { canvas, context };
    }
    return ctx;
  }

  async getTilePixels(
    coords: TileCoordinates,
  ): Promise<ImageData> | undefined {
    const { z, x, y } = coords;
    const response = await this.pmtiles.getZxy(z, x, y);
    if (!response || !response.data) return undefined;

    const blob = new Blob([response.data], { type: "image/webp" });
    const imageBitmap = await createImageBitmap(blob);

    const canvasRef = this.getCanvas();
    const { context } = canvasRef;
    context.drawImage(imageBitmap, 0, 0, this.tileSize, this.tileSize);
    const pixels = context.getImageData(0, 0, this.tileSize, this.tileSize);
    context.clearRect(0, 0, this.tileSize, this.tileSize);
    this.contextQueue.push(canvasRef);
    imageBitmap.close();

    return pixels;
  }

  getTileDataAvailable({ z }: TileCoordinates): boolean {
    if (z === this.maxZoom) return true;
    if (z < 2) return true;
    if (this.skipZoomLevel(z)) return false;
    if (z > this.maxZoom) return false;
    return true;
  }
}

export default PMTilesHeightmapResource;
