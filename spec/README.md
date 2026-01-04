# MapBundle Format Specification

MapBundle is a single-file archive format for tiled data, vector data, and resources needed to visualize the data. The contents of a MapBundle archive can be read directly from a web server without having to download the whole archive.

## Format Version

This document describes MapBundle format version 1.1.

## File Format

MapBundle files use the ZIP archive format with the following requirements:

- **File extension**: `.mapbundle`
- **Compression method**: STORE (no compression, compression level 0)
- **Rationale**: Uncompressed storage enables efficient random access and HTTP range requests

The use of standard ZIP format makes it easy to create and extract contents from a MapBundle file using common archiving tools.

## File Structure

### Required Folders

- **`styles/`** - REQUIRED. Contains one or more MapLibre GL JS style JSON files

### Recommended Folders

- **`data/`** - Recommended for storing PMTiles archives containing vector or raster tile data, and GeoJSON files for vector data
- **`fonts/`** - Recommended for glyph/font resources in PBF format
- **`sprites/`** - Recommended for sprite images and JSON metadata

Additional folders may be created as needed for other resources.

## Data Sources

### Tiled Data

Tiled data SHOULD be stored in Protomaps PMTiles format within the `data/` folder or another appropriate location. Each PMTiles file can be referenced by MapLibre style JSON sources.

### Vector Data

Vector data can be stored as GeoJSON files (e.g., `/data/boundaries.geojson`) within the `data/` folder or another appropriate location. GeoJSON files can be referenced from style sources using the standard MapLibre `type: "geojson"` source definition with a `data` property pointing to the file path.

## Style JSON Files

### Location and Naming

Style JSON files:

- SHALL be stored in the `/styles/` folder
- SHOULD use descriptive filenames (e.g., `light.json`, `dark.json`, `satellite.json`)
- Multiple style files are supported in a single MapBundle archive

### Style Name Property

Each style JSON SHOULD include a `name` property for display purposes:

```json
{
  "name": "My Map Style",
  "version": 8,
  ...
}
```

### URLs in Style JSON

All resource URLs that reference data within the MapBundle archive MUST be stored as absolute paths starting with `/`. URLs that do not start with `/` are assumed to reference external resources and will not be modified by the MapBundle reader.

**Internal MapBundle Resources:**
```json
{
  "glyphs": "/fonts/{fontstack}/{range}.pbf",
  "sprite": "/sprites/v4/light",
  "sources": {
    "protomaps": {
      "type": "vector",
      "url": "/data/tiles.pmtiles"
    },
    "boundaries": {
      "type": "geojson",
      "data": "/data/boundaries.geojson"
    }
  }
}
```

The `mapbundle://` protocol scheme will be added automatically by the MapBundle reader for paths starting with `/`. Storing paths this way makes extracted MapBundle contents compatible with standard tile servers (Maplibre Martin, tileserver-gl-js, etc.).

**External Resources:**

URLs that do not start with `/` (such as `http://`, `https://`, or other protocol schemes) are assumed to reference external resources and will not be modified by the MapBundle reader. This allows you to mix local MapBundle resources with external tile sources, fonts, or other resources hosted outside the MapBundle:

```json
{
  "sources": {
    "local-data": {
      "type": "vector",
      "url": "/data/tiles.pmtiles"
    },
    "external-tiles": {
      "type": "raster",
      "url": "https://example.com/tiles/{z}/{x}/{y}.png",
      "tileSize": 256
    }
  }
}
```

## Example Structure

A typical MapBundle archive structure:

```
my-map.mapbundle (ZIP archive with STORE compression)
├── styles/
│   ├── light.json
│   ├── dark.json
│   └── satellite.json
├── data/
│   ├── tiles.pmtiles
│   └── boundaries.geojson
├── fonts/
│   ├── Noto Sans Regular/
│   │   ├── 0-255.pbf
│   │   └── 256-511.pbf
│   └── Noto Sans Bold/
│       └── ...
└── sprites/
    ├── light.json
    ├── light.png
    ├── light@2x.json
    └── light@2x.png
```

## Creating MapBundle Files

To create a MapBundle file, use any ZIP utility with compression disabled:

```bash
# Using zip command (Unix/Linux/macOS)
zip -0 -r my-map.mapbundle styles/ data/ fonts/ sprites/

# Using 7-Zip (Windows/Unix/Linux/macOS) - Recommended for large files
7z a -tzip -mx0 my-map.mapbundle styles/ data/ fonts/ sprites/

# Using PowerShell (Windows) - Not recommended for large files
# Note: Compress-Archive does not support ZIP64 and will fail with files larger than 2GB
Compress-Archive -Path styles/,data/,fonts/,sprites/ -DestinationPath my-map.mapbundle -CompressionLevel NoCompression
```

**Note:** For MapBundle files larger than 2GB, use `zip` or `7-Zip` instead of PowerShell's `Compress-Archive`, as it does not support the ZIP64 extensions required for large archives.

## Compatibility

### MapLibre GL JS

MapBundle archives can be read locally or remotely from any HTTP server that supports range requests using the `maplibre-mapbundle-protocol` library. This enables efficient access to MapBundle contents without downloading the entire archive.

### Other Mapping Engines

Other mapping engines that support raster or vector tiles can support MapBundles if protocols for them are created, similar to the `maplibre-mapbundle-protocol`.

### Extracted Contents

The contents of a MapBundle can be easily extracted and used with standard tile servers such as MapLibre Martin, or tileserver-gl-js.
