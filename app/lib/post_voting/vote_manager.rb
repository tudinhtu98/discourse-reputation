PostVoting::VoteManager.class_eval do
    def self.vote(obj, user, direction: nil)
        direction ||= QuestionAnswerVote.directions[:up]
  
        ActiveRecord::Base.transaction do
          existing_vote =
            QuestionAnswerVote.find_by(
              user: user,
              votable: obj,
              direction: QuestionAnswerVote.reverse_direction(direction),
            )
  
          count_change =
            if existing_vote
              QuestionAnswerVote.directions[:up] == direction ? 2 : -2
            else
              QuestionAnswerVote.directions[:up] == direction ? 1 : -1
            end
          
          reputation_change =
            if existing_vote
              QuestionAnswerVote.directions[:up] == direction ? 7 : -7
            else
              QuestionAnswerVote.directions[:up] == direction ? 5 : -2
            end
  
          existing_vote.destroy! if existing_vote
  
          vote = QuestionAnswerVote.create!(user: user, votable: obj, direction: direction)
  
          vote_count = (obj.qa_vote_count || 0) + count_change

          reputation_count = (obj.qa_reputation_count || 0) + reputation_change
  
          obj.update!(qa_vote_count: vote_count, qa_reputation_count: reputation_count)
  
          DB.after_commit { publish_changes(obj, user, vote_count, reputation_count, direction) }
  
          vote
        end
    end
  
    def self.remove_vote(obj, user)
        ActiveRecord::Base.transaction do
            vote = QuestionAnswerVote.find_by(votable: obj, user: user)
            direction = vote.direction
            vote.destroy!
            count_change = QuestionAnswerVote.directions[:up] == direction ? -1 : 1
            reputation_change = QuestionAnswerVote.directions[:up] == direction ? -5 : 2

            vote_count = obj.qa_vote_count + count_change
            reputation_count = obj.qa_reputation_count + reputation_change

            obj.update!(qa_vote_count: vote_count, qa_reputation_count: reputation_count)
    
            DB.after_commit { publish_changes(obj, user, vote_count, reputation_count, nil) }
        end
    end

    def self.publish_changes(obj, user, vote_count, reputation_count, direction)
      if obj.is_a?(Post)
        obj.publish_change_to_clients!(
          :post_voting_post_voted,
          post_voting_user_voted_id: user.id,
          post_voting_vote_count: vote_count,
          post_voting_reputation_count: reputation_count,
          post_voting_user_voted_direction: direction,
          post_voting_has_votes: QuestionAnswerVote.exists?(votable: obj),
        )
      end
    end
end