import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import { iconNode } from "discourse-common/lib/icon-library";
import { avatarFor } from "discourse/widgets/post";
import autoGroupFlairForUser from "discourse/lib/avatar-flair";

createWidget("post-avatar-bottom", {
  tagName: "div.topic-avatar",

  settings: {
    size: "large",
    displayPosterName: false,
  },

  html(attrs) {
    let body;
    let hideFromAnonUser =
      this.siteSettings.hide_user_profiles_from_public && !this.currentUser;
    if (!attrs.user_id) {
      body = iconNode("far-trash-alt", { class: "deleted-user-avatar" });
    } else {
      body = avatarFor.call(
        this,
        this.settings.size,
        {
          template: attrs.avatar_template,
          username: attrs.username,
          name: attrs.name,
          url: attrs.usernameUrl,
          className: `main-avatar ${hideFromAnonUser ? "non-clickable" : ""}`,
          hideTitle: true,
        },
        {
          tabindex: "-1",
        }
      );
    }

    const postAvatarBody = [body];

    if (attrs.flair_url || attrs.flair_bg_color) {
      postAvatarBody.push(this.attach("avatar-flair", attrs));
    } else {
      const autoFlairAttrs = autoGroupFlairForUser(this.site, attrs);

      if (autoFlairAttrs) {
        postAvatarBody.push(this.attach("avatar-flair", autoFlairAttrs));
      }
    }

    const result = [h("div.post-avatar", postAvatarBody)];

    if (this.settings.displayPosterName) {
      result.push(this.attach("post-avatar-user-info", attrs));
    }

    return result;
  },
});