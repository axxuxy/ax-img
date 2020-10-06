import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { Message, MessageBox } from "element-ui";

Vue.config.productionTip = false;

Vue.prototype.$message = Message;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$alert = MessageBox.alert;

import electron from "electron";

if (process)
  window.addEventListener("keydown", ev => {
    if (ev.keyCode === 123) {
      let web = electron.remote.getCurrentWindow().webContents;
      if (web.isDevToolsOpened()) {
        web.closeDevTools();
      } else {
        web.openDevTools();
      }
    }
  });

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
