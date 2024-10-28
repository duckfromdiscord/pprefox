var port = browser.runtime.connectNative("pprefox_rs");

var themes = [];
browser.management.getAll().then((extensions) => {
  for (let extension of extensions) {
    if (extension.type !== 'theme') {
      continue;
    }
    themes.push({ "name": extension.name, "id": extension.id });
  }
});

function tabs_filter(tabs) {
  // filter out extra info we don't need, like cookie info
  return tabs.map(tab => {
    return Object.keys(tab)
      .filter(key => ["active", "id", "index", "pinned", "title", "url", "windowId"].includes(key))
      .reduce((acc, key) => {
        acc[key] = tab[key];
        return acc;
      }, {});
  });
}

port.onMessage.addListener((msg) => {
  if (msg['command'] === "list_themes") {
    if (msg.hasOwnProperty("uuid")) {
      var outgoing = { "uuid": msg['uuid'], "themes": themes };
      port.postMessage(outgoing);
    }
  }
  if (msg['command'] === "set_theme") {
    if (msg.hasOwnProperty("theme_id")) {
      browser.management.setEnabled(msg['theme_id'], true);
    }
  }
  if (msg['command'] === "list_tabs") {
    if (msg.hasOwnProperty("uuid")) {
      var query = { "windowType": "normal" };
      if (msg.hasOwnProperty("query")) {
        query = msg['query'];
      }
      browser.tabs.query(query).then((tabs) => {
        var outgoing = {
          "uuid": msg['uuid'], "success": true, "tabs": tabs_filter(tabs)
        };
        port.postMessage(outgoing);
      });
    }
  }
});