import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";
import { iconNode } from "discourse-common/lib/icon-library";
import { includeAttributes } from "discourse/lib/transform-post";

export default {
  name: "initializer-reopen-post-meta-data",
  initialize() {
    withPluginApi("0.11.0", api => {
      includeAttributes("user_reputation_count");
      includeAttributes("user_gold_badge_count");
      includeAttributes("user_silver_badge_count");
      includeAttributes("user_bronze_badge_count");

      function showReplyTab(attrs, siteSettings) {
        return (
          attrs.replyToUsername &&
          (!attrs.replyDirectlyAbove || !siteSettings.suppress_reply_directly_above)
        );
      }

      api.reopenWidget("post-meta-data", {
        html(attrs) {
          let postInfo = [];


          if (attrs.isWhisper) {
            const groups = this.site.get("whispers_allowed_groups_names");
            let title = "";

            if (groups?.length > 0) {
              title = I18n.t("post.whisper_groups", {
                groupNames: groups.join(", "),
              });
            } else {
              title = I18n.t("post.whisper");
            }

            postInfo.push(
              h(
                "div.post-info.whisper",
                {
                  attributes: { title },
                },
                iconNode("far-eye-slash")
              )
            );
          }

          if (attrs.via_email) {
            postInfo.push(this.attach("post-email-indicator", attrs));
          }

          if (attrs.locked) {
            postInfo.push(this.attach("post-locked-indicator", attrs));
          }

          if (attrs.version > 1 || attrs.wiki) {
            postInfo.push(this.attach("post-edits-indicator", attrs));
          }

          if (attrs.multiSelect) {
            postInfo.push(this.attach("select-post", attrs));
          }

          if (showReplyTab(attrs, this.siteSettings)) {
            postInfo.push(this.attach("reply-to-tab", attrs));
          }

          postInfo.push(this.attach("post-date", attrs));

          postInfo.push(
            h(
              "div.read-state",
              {
                className: attrs.read ? "read" : null,
                attributes: {
                  title: I18n.t("post.unread"),
                },
              },
              iconNode("circle")
            )
          );

          const result = [];

          result.push(h("div.post-infos", postInfo));

          const userInfos = [];
          if (this.settings.displayPosterName) {
            userInfos.push(this.attach("poster-name", attrs));
          }

          userInfos.push(
            h("div.badge-reputation-container", [
              this.attach("user-reputation-count", { reputationCount: attrs.user_reputation_count, username: attrs.username }),
              this.attach("user-badge-count-by-type", {
                goldBadgeCount: attrs.user_gold_badge_count,
                silverBadgeCount: attrs.user_silver_badge_count,
                bronzeBadgeCount: attrs.user_bronze_badge_count,
              })
            ]),
          );

          result.push(h("div.user-infos", [
            this.attach("post-avatar-bottom", attrs),
            h("div.username-reputation-container", userInfos)
          ]));
          return h("div.topic-meta-data-container", result);
        },
      });
    });
  }
}
