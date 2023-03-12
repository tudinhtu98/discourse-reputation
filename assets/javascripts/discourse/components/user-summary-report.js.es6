import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import PeriodComputationMixin from "../mixins/period-computation";

export default Component.extend(PeriodComputationMixin, {
    userId: null,

    _reportsForPeriodURL(period) {
        this.set("period", period);
    },

    @discourseComputed("startDate", "endDate", "userId")
    filters(startDate, endDate, userId) {
        return { startDate, endDate, customFilters: { user_id: userId } };
    },
});