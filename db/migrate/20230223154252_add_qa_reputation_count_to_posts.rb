# frozen_string_literal: true

class AddQaReputationCountToPosts < ActiveRecord::Migration[6.1]
  def up
    add_column :posts, :qa_reputation_count, :integer, default: 0
  end

  def down
    remove_column :posts, :qa_reputation_count
  end
end
