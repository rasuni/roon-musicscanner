let RoonApi = require("node-roon-api");
let RoonApiStatus = require("node-roon-api-status");

let roon = new RoonApi({
    extension_id: 'org.rasuni.musicscanner',
    display_name: 'Music Scanner extension',
    display_version: "0.0.1",
    publisher: 'rasuni',
    email: 'ralph.sigrist@rasuni.org',
    website: 'https://github.com/rasuni/roon-musicscanner'
});

let svc_status = new RoonApiStatus(roon);

roon.init_services({ provided_services: [svc_status] });

svc_status.set_status("All is good", false);

roon.start_discovery();
