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

        post_sum = Post.where(
            "posts.created_at < ?",
            start_date
            ).where(user_id: user_id).sum(:qa_reputation_count)
        qac_sum = QuestionAnswerComment.where(
            "question_answer_comments.created_at < ?",
            start_date
            ).where(user_id: user_id).sum(:qa_reputation_count)
        sum_before_start_date = 100 + post_sum + qac_sum;

        # Fill all date with sum reputation
        current_date = start_date.to_date
        end_date_converted = end_date.to_date
        prev_value = sum_before_start_date;

        while current_date <= end_date_converted do
            if result.key?(current_date)
                prev_value += result[current_date]
                result[current_date] = prev_value
            else
                result[current_date] = prev_value
            end
            current_date += 1.day
        end
        sorted_result = result.sort_by { |key, value| key }.to_h
    end
end