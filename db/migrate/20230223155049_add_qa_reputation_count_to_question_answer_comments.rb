# frozen_string_literal: true

class AddQaReputationCountToQuestionAnswerComments < ActiveRecord::Migration[6.1]
  def up
    add_column :question_answer_comments, :qa_reputation_count, :integer, default: 100
  end

  def down
    remove_column :question_answer_comments, :qa_reputation_count
  end
end