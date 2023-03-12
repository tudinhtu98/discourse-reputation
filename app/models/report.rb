class Report
    include Reports::Reputations

    def add_user_id_filter
        user_id = filters[:user_id].to_s if filters[:user_id].present?
    end
end