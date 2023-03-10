import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import PeriodComputationMixin from "../mixins/period-computation";

export default Component.extend(PeriodComputationMixin, {
    @discourseComputed("startDate", "endDate")
    filters(startDate, endDate) {
        return { startDate, endDate };
    },
});