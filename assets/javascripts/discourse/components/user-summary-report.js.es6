import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import PeriodComputationMixin from "../mixins/period-computation";
import { getOwner } from "discourse-common/lib/get-owner";

export default Component.extend(PeriodComputationMixin, {
    username: null,

    didInsertElement() {
        this._super(...arguments);
        const path = getOwner(this).lookup('service:router');
        const username = path.currentRoute.parent.params.username;
        this.set("username", username);
    },

    @discourseComputed("startDate", "endDate", "username")
    filters(startDate, endDate, username) {
        return { startDate, endDate, customFilters: { username } };
    },
});