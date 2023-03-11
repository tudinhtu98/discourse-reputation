class Reputation
    def self.reputation_score_by_user_id_per_day(
        start_date,
        end_date,
        username = nil
    )
        user = User.find_by_username(username)
        result = Post.where(
            "created_at >= ? AND created_at <= ?",
            start_date,
            end_date,
            ).where(user_id: user.id)
        # reputationComment = QuestionAnswerComment.where(user_id: self.id).sum(:qa_reputation_count)
        result = result.group("date(created_at)").order("date(created_at)")
        result.sum(:qa_reputation_count)
    end
end