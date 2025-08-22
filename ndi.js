/*
  Copyright (c) 2021 Dr. Ralf S. Engelschall

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/*  external requirements  */
import fs from "fs"
import path from "path"
import os from "os"
import shell from "shelljs"
import { execa } from "execa"
import zip from "cross-zip"
import { got } from "got"
import tmp from "tmp"

/*  establish asynchronous environment  */
;(async () => {
    console.log("++ ad-hoc assembling NDK SDK distribution subset from original sources")
    if (os.platform() === "win32") {
        /*  download innoextract utility  */
        const url1 = "https://constexpr.org/innoextract/files/innoextract-1.9-windows.zip"
        console.log("-- downloading innoextract utility")
        const data1 = await got.get(url1, { responseType: "buffer" })
        const file1 = tmp.tmpNameSync()
        await fs.promises.writeFile(file1, data1.body, { encoding: null })

        /*  extract innoextract utility  */
        console.log("-- extracting innoextract utility")
        const dir1 = tmp.tmpNameSync()
        zip.unzipSync(file1, dir1)

        /*  download NDI SDK distribution  */
        const url2 = "https://downloads.ndi.tv/SDK/NDI_SDK/NDI%206%20SDK.exe"
        console.log("-- dowloading NDI SDK distribution")
        const data2 = await got.get(url2, { responseType: "buffer" })
        const file2 = tmp.tmpNameSync()
        await fs.promises.writeFile(file2, data2.body, { encoding: null })

        /*  extract NDI SDK distribution  */
        console.log("-- extracting NDI SDK distribution")
        const dir2 = tmp.tmpNameSync()
        shell.mkdir("-p", dir2)
        await execa(path.join(dir1, "innoextract.exe"), [ "-s", "-d", dir2, file2 ],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" })

        /*  assemble NDI SDK subset  */
        console.log("-- assembling NDI SDK subset")
        shell.rm("-rf", "ndi")
        shell.mkdir("-p", "ndi")
        shell.mkdir("-p", "ndi/lib/win-x86")
        shell.mkdir("-p", "ndi/lib/win-x64")
        shell.mv(path.join(dir2, "app/Include"), "ndi/include")
        shell.mv(path.join(dir2, "app/Lib/x86/Processing.NDI.Lib.x86.lib"), "ndi/lib/win-x86/Processing.NDI.Lib.x86.lib")
        shell.mv(path.join(dir2, "app/Bin/x86/Processing.NDI.Lib.x86.dll"), "ndi/lib/win-x86/Processing.NDI.Lib.x86.dll")
        shell.mv(path.join(dir2, "app/Lib/x64/Processing.NDI.Lib.x64.lib"), "ndi/lib/win-x64/Processing.NDI.Lib.x64.lib")
        shell.mv(path.join(dir2, "app/Bin/x64/Processing.NDI.Lib.x64.dll"), "ndi/lib/win-x64/Processing.NDI.Lib.x64.dll")

        /*  remove temporary files  */
        console.log("-- removing temporary files")
        shell.rm("-f", file1)
        shell.rm("-f", file2)
        shell.rm("-rf", dir1)
        shell.rm("-rf", dir2)
    }
    else if (os.platform() === "darwin") {
        /*  download NDI SDK distribution  */
        const url1 = "https://downloads.ndi.tv/SDK/NDI_SDK_Mac/Install_NDI_SDK_v6_Apple.pkg"
        console.log("-- dowloading NDI SDK distribution")
        const data1 = await got.get(url1, { responseType: "buffer" })
        const file1 = tmp.tmpNameSync()
        await fs.promises.writeFile(file1, data1.body, { encoding: null })

        /*  extract NDI SDK distribution  */
        console.log("-- extracting NDI SDK distribution")
        const dir1 = tmp.tmpNameSync()
        shell.rm("-rf", dir1)
        await execa("pkgutil", [ "--expand", file1, dir1 ],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" })
        await execa("cpio", [ "-idmu", "-F", path.join(dir1, "NDI_SDK_Component.pkg/Payload") ],
            { cwd: dir1, stdin: "inherit", stdout: "ignore", stderr: "ignore" })

        /*  debug: list extracted files  */
        console.log("-- debug: listing extracted files")
        console.log("Contents of extraction directory:")
        shell.exec(`find "${dir1}" -name "*.dylib" -o -name "*.h"`)

        /*  assemble NDI SDK subset  */
        console.log("-- assembling NDI SDK subset")
        shell.rm("-rf", "ndi")
        shell.mkdir("-p", "ndi/include")
        shell.mkdir("-p", "ndi/lib/mac-a64")
        shell.mkdir("-p", "ndi/lib/mac-x64")
        
        // Copy include files
        const includeFiles = shell.ls(path.join(dir1, "NDI SDK for Apple/include/*.h"))
        includeFiles.forEach(file => {
            shell.cp(file, "ndi/include/")
        })
        
        // Copy library files to both architectures
        const libFiles = shell.ls(path.join(dir1, "NDI SDK for Apple/lib/macOS/*"))
        libFiles.forEach(file => {
            shell.cp(file, "ndi/lib/mac-a64/")
            shell.cp(file, "ndi/lib/mac-x64/")
        })
        
        // Debug: verify files were copied
        console.log("-- debug: verifying copied files")
        console.log("Include files:", shell.ls("ndi/include/"))
        console.log("mac-a64 files:", shell.ls("ndi/lib/mac-a64/"))
        console.log("mac-x64 files:", shell.ls("ndi/lib/mac-x64/"))

        /*  remove temporary files  */
        console.log("-- removing temporary files")
        shell.rm("-f", file1)
        shell.rm("-rf", dir1)
    }
    else if (os.platform() === "linux") {
        /*  download NDI SDK distribution  */
        const url1 = "https://downloads.ndi.tv/SDK/NDI_SDK_Linux/Install_NDI_SDK_v6_Linux.tar.gz"
        console.log("-- dowloading NDI SDK distribution")
        const data1 = await got.get(url1, { responseType: "buffer" })
        const file1 = tmp.tmpNameSync()
        await fs.promises.writeFile(file1, data1.body, { encoding: null })

        /*  extract NDI SDK distribution  */
        console.log("-- extracting NDI SDK distribution")
        const dir1 = tmp.tmpNameSync()
        shell.mkdir("-p", dir1)
        await execa("tar", [ "-z", "-x", "-C", dir1, "-f", file1 ],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" })
        await execa("sh", [ "-c", `echo "y" | PAGER=cat sh Install_NDI_SDK_v6_Linux.sh` ],
            { cwd: dir1, stdin: "inherit", stdout: "ignore", stderr: "inherit" })

        /*  debug: list extracted files  */
        console.log("-- debug: listing extracted files")
        console.log("Contents of extraction directory:")
        shell.exec(`find "${dir1}" -name "*.so*" -o -name "*.h" | head -20`)
        console.log("Library directories:")
        shell.exec(`ls -la "${dir1}/NDI SDK for Linux/lib/" || echo "lib directory not found"`)

        /*  assemble NDI SDK subset  */
        console.log("-- assembling NDI SDK subset")
        shell.rm("-rf", "ndi")
        shell.mkdir("-p", "ndi/include")
        shell.mkdir("-p", "ndi/lib/lnx-x86")
        shell.mkdir("-p", "ndi/lib/lnx-x64")
        shell.mkdir("-p", "ndi/lib/lnx-a64")
        
        // Copy include files
        const includeFiles = shell.ls(path.join(dir1, "NDI SDK for Linux/include/*.h"))
        includeFiles.forEach(file => {
            shell.cp(file, "ndi/include/")
        })
        
        // Copy library files for each architecture
        const x86Files = shell.ls(path.join(dir1, "NDI SDK for Linux/lib/i686-linux-gnu/*")) || []
        x86Files.forEach(file => {
            shell.cp(file, "ndi/lib/lnx-x86/")
        })
        
        const x64Files = shell.ls(path.join(dir1, "NDI SDK for Linux/lib/x86_64-linux-gnu/*")) || []
        x64Files.forEach(file => {
            shell.cp(file, "ndi/lib/lnx-x64/")
        })
        
        const a64Files = shell.ls(path.join(dir1, "NDI SDK for Linux/lib/aarch64-rpi4-linux-gnueabi/*")) || []
        a64Files.forEach(file => {
            shell.cp(file, "ndi/lib/lnx-a64/")
        })
        
        // Debug: verify files were copied
        console.log("-- debug: verifying copied files")
        console.log("Include files:", shell.ls("ndi/include/"))
        console.log("lnx-x86 files:", shell.ls("ndi/lib/lnx-x86/"))
        console.log("lnx-x64 files:", shell.ls("ndi/lib/lnx-x64/"))
        console.log("lnx-a64 files:", shell.ls("ndi/lib/lnx-a64/"))

        /*  remove temporary files  */
        console.log("-- removing temporary files")
        shell.rm("-f", file1)
        shell.rm("-rf", dir1)
    }
})().catch((err) => {
    console.log(`** ERROR: ${err}`)
})

