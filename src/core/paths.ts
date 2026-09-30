export function normalize(filePath: string): string {
  return filePath.replaceAll("\\", "/")
}
