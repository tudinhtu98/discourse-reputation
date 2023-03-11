class Report
    include Reports::Reputations

    def add_username_filter
        username = filters[:username].to_s if filters[:username].present?
    end
end