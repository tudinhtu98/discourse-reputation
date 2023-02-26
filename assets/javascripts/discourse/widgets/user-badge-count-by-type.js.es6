import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import I18n from "I18n";

createWidget('user-badge-count-by-type', {
  tagName: 'div.user-badge-count-by-type',
  buildKey: () => `user-badge-count-by-type`,

  html(attrs, state) {
    const goldBadgeCount = attrs.goldBadgeCount ? attrs.goldBadgeCount : 0;
    const silverBadgeCount = attrs.silverBadgeCount ? attrs.silverBadgeCount : 0;
    const bronzeBadgeCount = attrs.bronzeBadgeCount ? attrs.bronzeBadgeCount : 0;

    return [
      h("span.badge", {
        title: `${goldBadgeCount} ${I18n.t(goldBadgeCount > 1 ? "gold_badge.many" : "gold_badge.one")}`
      }, [
        h("span.gold-badge"),
        h("span.gold-badge-count", `${goldBadgeCount}`),
      ]),
      h("span.badge", {
        title: `${silverBadgeCount} ${I18n.t(silverBadgeCount > 1 ? "silver_badge.many" : "silver_badge.one")}`
      }, [
        h("span.silver-badge"),
        h("span.silver-badge-count", `${silverBadgeCount}`),
      ]),
      h("span.badge", {
        title: `${bronzeBadgeCount} ${I18n.t(bronzeBadgeCount > 1 ? "bronze_badge.many" : "bronze_badge.one")}`
      }, [
        h("span.bronze-badge"),
        h("span.bronze-badge-count", `${bronzeBadgeCount}`),
      ]),
    ];
  },
});