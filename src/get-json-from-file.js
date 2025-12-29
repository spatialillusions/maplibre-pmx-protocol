export default async function getJsonFromFile(file, pmxFiles, source) {
  const decoder = new TextDecoder("utf-8");
  if (pmxFiles[file]) {
    const fileOffset = pmxFiles[file].absoluteOffset;
    const fileJSON = await source.getBytes(fileOffset, pmxFiles[file].size);
    return JSON.parse(decoder.decode(fileJSON.data));
  }
  return {};
}
