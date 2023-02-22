import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

createWidget('user-vote-count', {
  tagName: 'div.user-vote-count',
  buildKey: () => `user-vote-count`,

  html(attrs, state) {
    const voteCount = attrs.voteCount ? attrs.voteCount.toString() : "0";
    return [
      h("span.vote_count", `reputation score: ${voteCount}`)
    ];
  },
});