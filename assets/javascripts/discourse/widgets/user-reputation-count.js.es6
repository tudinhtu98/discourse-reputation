import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

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
          "data-reputation-score": reputationCount
        }
      }, `reputation score: ${reputationCount}`)
    ];
  },
});