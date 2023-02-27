import DecoratorHelper from "discourse/widgets/decorator-helper";
import PostCooked from "discourse/widgets/post-cooked";
import { applyDecorators } from "discourse/widgets/widget";
import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";

export default {
  name: "initializer-reopen-post-article-body-avatar",
  initialize() {
    withPluginApi("0.11.0", api => {

      api.reopenWidget("post-avatar", {
        html() {
          return;
        }
      });

      api.reopenWidget("embedded-post", {
        html(attrs, state) {
          attrs.embeddedPost = true;
          return [
            h("div.row", [
              this.attach("post-avatar-bottom", attrs),
              h("div.topic-body", [
                h("div.topic-meta-data.embedded-reply", [
                  this.attach("poster-name", attrs),
                  this.attach("post-link-arrow", {
                    name: attrs.username,
                    above: state.above,
                    shareUrl: attrs.customShare,
                  }),
                ]),
                new PostCooked(attrs, new DecoratorHelper(this), this.currentUser),
              ]),
            ]),
          ];
        },
      });

      api.reopenWidget("post-article", {
        html(attrs, state) {
          const rows = [
            h("span.tabLoc", {
              attributes: { "aria-hidden": true, tabindex: -1 },
            }),
          ];
          if (state.repliesAbove.length) {
            const replies = state.repliesAbove.map((p) => {
              return this.attach("embedded-post", p, {
                model: p.asPost,
                state: { above: true },
              });
            });

            rows.push(
              h(
                "div.row",
                h(
                  `section.embedded-posts.top.topic-body#embedded-posts__top--${attrs.post_number}`,
                  [
                    this.attach("button", {
                      title: "post.collapse",
                      icon: "chevron-down",
                      action: "toggleReplyAbove",
                      actionParam: "true",
                      className: "btn collapse-down",
                    }),
                    replies,
                  ]
                )
              )
            );
          }

          if (!attrs.deleted_at && attrs.notice) {
            rows.push(h("div.row", [this.attach("post-notice", attrs)]));
          }

          rows.push(
            h("div.row", [
              this.attach("post-avatar", attrs),
              this.attach("post-body", {
                ...attrs,
                repliesAbove: state.repliesAbove,
              }),
            ])
          );
          return rows;
        },
      });

      api.reopenWidget("post-body", {
        html(attrs, state) {
          const postContents = this.attach("post-contents", attrs);
          let result = [];
          result = result.concat(
            applyDecorators(this, "after-meta-data", attrs, state)
          );
          result.push(postContents);
          result.push(this.attach("actions-summary", attrs));
          result.push(this.attach("post-links", attrs));
          if (attrs.showTopicMap) {
            result.push(this.attach("topic-map", attrs));
          }
          result.push(this.attach("post-meta-data", attrs));

          return result;
        },
      });
    });
  }
}
