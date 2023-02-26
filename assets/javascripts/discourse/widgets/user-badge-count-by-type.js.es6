import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

createWidget('user-badge-count-by-type', {
  tagName: 'div.user-badge-count-by-type',
  buildKey: () => `user-badge-count-by-type`,

  html(attrs, state) {
    const goldBadgeCount = attrs.goldBadgeCount ? attrs.goldBadgeCount : 0;
    const silverBadgeCount = attrs.silverBadgeCount ? attrs.silverBadgeCount : 0;
    const bronzeBadgeCount = attrs.bronzeBadgeCount ? attrs.bronzeBadgeCount : 0;

    return [
      h("span.badge", [
        h("span.gold-badge"),
        h("span.badge", `${goldBadgeCount}`),
      ]),
      h("span.badge", [
        h("span.silver-badge"),
        h("span.badge", `${silverBadgeCount}`),
      ]),
      h("span.badge", [
        h("span.bronze-badge"),
        h("span.badge", `${bronzeBadgeCount}`),
      ]),
    ];
  },
});