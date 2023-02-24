import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";
import { includeAttributes } from "discourse/lib/transform-post";

export default {
  name: "initializer-reopen-post-meta-data",
  initialize() {
    withPluginApi("0.11.0", api => {
      includeAttributes("user_reputation_count");

      api.reopenWidget("post-meta-data", {
        html(attrs) {
          return [
            h("div", {className: "username-container"}, this._super(...arguments)),
            h("div", {className: "username-reputation-container"}, [
              this.attach("user-reputation-count", { reputationCount: attrs.user_reputation_count, username: attrs.username })
            ])
          ];
        },
      });
    });
  }
}
