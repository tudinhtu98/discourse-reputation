import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";
import { iconNode } from "discourse-common/lib/icon-library";
import { includeAttributes } from "discourse/lib/transform-post";

export default {
  name: "initializer-reopen-post-meta-data",
  initialize() {
    withPluginApi("0.11.0", api => {
      includeAttributes("user_vote_count");

      api.reopenWidget("post-meta-data", {
        html(attrs) {
          return [
            h("div", {className: "username-container"}, this._super(...arguments)),
            h("div", {className: "username-reputation-container"}, [
              this.attach("user-vote-count", { voteCount: attrs.user_vote_count })
            ])
          ];
        },
      });
    });
  }
}
