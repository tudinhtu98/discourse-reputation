import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import I18n from "I18n";

createWidget('user-reputation-count', {
  tagName: 'div.user-reputation-count',
  buildKey: () => `user-reputation-count`,

  html(attrs, state) {
    const reputationCount = attrs.reputationCount ? attrs.reputationCount : 0;
    const username = attrs.username ? attrs.username : "";

    return [
      h("span", {
        attributes: {
          "data-reputation-username": username,
          "data-reputation-score": reputationCount,
          "title": `${reputationCount} ${I18n.t("reputation_score").toLowerCase()}`,
        }
      }, reputationCount)
    ];
  },
});