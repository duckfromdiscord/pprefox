var port = browser.runtime.connectNative("pprefox_rs");

var themes = [];
browser.management.getAll().then((extensions) => {
    for (let extension of extensions) {
      if (extension.type !== 'theme') {
        continue;
      }
      themes.push({"name": extension.name, "id": extension.id});
    }
});

port.onMessage.addListener((msg) => {
  if (msg['command'] === "list_themes") {
    if (msg.hasOwnProperty("uuid")) { 
        var outgoing = {"uuid": msg['uuid'], "themes": themes};
        port.postMessage(outgoing);
    }
  }
  if (msg['command'] === "set_theme") {
    if (msg.hasOwnProperty("theme_id")) {
        browser.management.setEnabled(msg['theme_id'], true);
    }
  }
});