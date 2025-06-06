{
    "variables": {
      "ndi_dir": "<(module_root_dir)/ndi",
      "openssl_fips": ""
    },
    "targets": [ {
        "target_name": "grandiose",
        "sources": [
            "src/grandiose_util.cc",
            "src/grandiose_find.cc",
            "src/grandiose_send.cc",
            "src/grandiose_receive.cc",
            "src/grandiose_routing.cc",
            "src/grandiose.cc"
        ],
        "include_dirs": [ "ndi/include" ],
        "conditions":[
            [ "OS == 'win' and target_arch == 'ia32'", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/win-x86/Processing.NDI.Lib.x86.dll" ]
                } ],
                "link_settings": {
                    "libraries":    [ "Processing.NDI.Lib.x86.lib" ],
                    "library_dirs": [ "<(ndi_dir)/lib/win-x86" ]
                }
            } ],
            [ "OS == 'win' and target_arch == 'x64'", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/win-x64/Processing.NDI.Lib.x64.dll" ]
                } ],
                "link_settings": {
                    "libraries":    [ "Processing.NDI.Lib.x64.lib" ],
                    "library_dirs": [ "<(ndi_dir)/lib/win-x64" ]
                }
            } ],
            [ "OS == 'linux' and target_arch == 'ia32'", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/lnx-x86/libndi.so",
                                      "<(ndi_dir)/lib/lnx-x86/libndi.so.6",
                                      "<(ndi_dir)/lib/lnx-x86/libndi.so.6.2.0" ]
                } ],
                "link_settings": {
                    "libraries":    [ "-Wl,-rpath,'$$ORIGIN'", "-lndi" ],
                    "library_dirs": [ "<(ndi_dir)/lib/lnx-x86" ]
                }
            } ],
            [ "OS == 'linux' and target_arch == 'x64'", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/lnx-x64/libndi.so",
                                      "<(ndi_dir)/lib/lnx-x64/libndi.so.6",
                                      "<(ndi_dir)/lib/lnx-x64/libndi.so.6.2.0" ]
                } ],
                "link_settings": {
                    "libraries":    [ "-Wl,-rpath,'$$ORIGIN'", "-lndi" ],
                    "library_dirs": [ "<(ndi_dir)/lib/lnx-x64" ]
                }
            } ],
            [ "OS == 'linux' and target_arch == 'arm'", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/lnx-armv7l/libndi.so",
                                      "<(ndi_dir)/lib/lnx-armv7l/libndi.so.6",
                                      "<(ndi_dir)/lib/lnx-armv7l/libndi.so.6.2.0" ]
                } ],
                "link_settings": {
                    "libraries":    [ "-Wl,-rpath,'$$ORIGIN'", "-lndi" ],
                    "library_dirs": [ "<(ndi_dir)/lib/lnx-armv7l" ]
                }
            } ],
            [ "OS == 'linux' and target_arch == 'arm64'", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/lnx-arm64/libndi.so",
                                      "<(ndi_dir)/lib/lnx-arm64/libndi.so.6",
                                      "<(ndi_dir)/lib/lnx-arm64/libndi.so.6.2.0" ]
                } ],
                "link_settings": {
                    "libraries":    [ "-Wl,-rpath,'$$ORIGIN'", "-lndi" ],
                    "library_dirs": [ "<(ndi_dir)/lib/lnx-arm64" ]
                }
            } ],
            [ "OS == 'mac' and (target_arch == 'x64' or target_arch == 'arm64')", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/mac/libndi.dylib",
                                      "<(ndi_dir)/lib/mac/libndi_licenses.txt" ]
                } ],
                "link_settings": {
                    "libraries":    [ "-Wl,-rpath,@loader_path", "-lndi" ],
                    "library_dirs": [ "<(ndi_dir)/lib/mac" ]
                }
            } ]
        ]
    } ]
}
