import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseDir = path.join(__dirname, "ndi", "lib")
const buildRelease = path.join(__dirname, "build", "Release")
if (!fs.existsSync(buildRelease)) fs.mkdirSync(buildRelease, { recursive: true })

let archFolder
switch (process.arch) {
    case "ia32":
        archFolder = "lnx-x86"
        break
    case "x64":
        archFolder = "lnx-x64"
        break
    case "arm64":
        archFolder = "lnx-a64"
        break
    default:
        console.error("Unsupported architecture:", process.arch)
        process.exit(1)
}

const srcDir = path.join(baseDir, archFolder)
if (!fs.existsSync(srcDir)) {
    console.error("Source directory does not exist:", srcDir)
    process.exit(1)
}

for (const file of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, file)
    const dst = path.join(buildRelease, file)
    fs.copyFileSync(src, dst)
    console.log(`Copied ${file} to build/Release`)
}

// Create a dummy output file for gyp
const dummyOut = path.join(buildRelease, ".ndi-prepared")
fs.writeFileSync(dummyOut, "ok\n")
console.log("Created dummy output file for gyp:", dummyOut)
