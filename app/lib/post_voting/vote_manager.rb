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
              QuestionAnswerVote.directions[:up] == direction ? 7 : -7
            else
              QuestionAnswerVote.directions[:up] == direction ? 5 : -2
            end
  
          existing_vote.destroy! if existing_vote
  
          vote = QuestionAnswerVote.create!(user: user, votable: obj, direction: direction)
  
          vote_count = (obj.qa_vote_count || 0) + count_change
  
          obj.update!(qa_vote_count: vote_count)
  
          DB.after_commit { publish_changes(obj, user, vote_count, direction) }
  
          vote
        end
    end
  
    def self.remove_vote(obj, user)
        ActiveRecord::Base.transaction do
            vote = QuestionAnswerVote.find_by(votable: obj, user: user)
            direction = vote.direction
            vote.destroy!
            count_change = QuestionAnswerVote.directions[:up] == direction ? -5 : 2
            vote_count = obj.qa_vote_count + count_change
            obj.update!(qa_vote_count: vote_count)
    
            DB.after_commit { publish_changes(obj, user, vote_count, nil) }
        end
    end
end