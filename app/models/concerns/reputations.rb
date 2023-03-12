# frozen_string_literal: true

module Reports::Reputations
  extend ActiveSupport::Concern

  class_methods do
    def report_reputations(report)
      user_id = report.add_user_id_filter
      basic_report_about report,
                         Reputation,
                         :reputation_score_by_user_id_per_day,
                         report.start_date,
                         report.end_date,
                         user_id
    end
  end
end
