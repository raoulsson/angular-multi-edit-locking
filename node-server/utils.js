import fs from "fs";

export function readJsonFileSync(filePath)  {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function writeJsonFileSync(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}
