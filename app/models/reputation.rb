class Reputation
    def self.reputation_score_by_user_id_per_day(
        start_date,
        end_date,
        user_id = nil
    )
        post_result = Post.where(
            "posts.created_at >= ? AND posts.created_at <= ?",
            start_date,
            end_date,
            ).where(user_id: user_id)
        post_result = post_result.group("date(created_at)").order("date(created_at)").sum(:qa_reputation_count);

        qac_result = QuestionAnswerComment.where(
            "question_answer_comments.created_at >= ? AND question_answer_comments.created_at <= ?",
            start_date,
            end_date,
            ).where(user_id: user_id)
        qac_result = qac_result.group("date(created_at)").order("date(created_at)").sum("qa_reputation_count");
        
        result = post_result.merge(qac_result) { |key, v1, v2| v1 + v2 }
    end
end