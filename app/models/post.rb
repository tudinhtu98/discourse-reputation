Post.class_eval do
    def self.reputation_score_by_user_id_per_day(
        start_date,
        end_date,
    )
        result = Post.where(
            "posts.created_at >= ? AND posts.created_at <= ?",
            start_date,
            end_date,
            ).where(user_id: 6704)
        # reputationComment = QuestionAnswerComment.where(user_id: self.id).sum(:qa_reputation_count)
        result = result.group("date(posts.created_at)").order("date(posts.created_at)")
        result.count
end