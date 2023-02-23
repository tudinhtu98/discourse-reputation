import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

createWidget('user-reputation-count', {
  tagName: 'div.user-reputation-count',
  buildKey: () => `user-reputation-count`,

  html(attrs, state) {
    const reputationCount = attrs.reputationCount ? attrs.reputationCount.toString() : "0";
    return [
      h("span.vote_count", `reputation score: ${reputationCount}`)
    ];
  },
});