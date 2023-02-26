import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "initializer-reopen-user-dropdown",
  initialize() {
    withPluginApi("0.11.0", api => {
      api.reopenWidget("user-dropdown", {
        html(attrs) {
          return [
            this._super(...arguments),
            this.attach("user-reputation-count", {
              reputationCount: attrs.user.reputation_count,
              username: attrs.user.username,
            }),
            this.attach("user-badge-count-by-type", {
              goldBadgeCount: attrs.user.gold_badge_count,
              silverBadgeCount: attrs.user.silver_badge_count,
              bronzeBadgeCount: attrs.user.bronze_badge_count,
            })
          ];
        },
      });
    });
  }
}