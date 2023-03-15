# name: Discourse reputation
# about: Description for this plugin
# version: 0.1.0
# authors: Tu Dinh Tu
# url:

enabled_site_setting :discourse_reputation_enabled

PLUGIN_NAME ||= 'discourse_reputation'.freeze
register_asset 'stylesheets/discourse-reputation.scss'
after_initialize do
    %w[
        ../app/lib/post_voting/vote_manager.rb
        ../app/controllers/discourse_reputation_controller.rb
        ../app/controllers/reputation_reports_controller.rb
        ../app/models/concerns/reputations.rb
        ../app/models/report.rb
        ../app/models/reputation.rb
      ].each { |path| load File.expand_path(path, __FILE__) }

    module ::DiscourseReputation
        class Engine < ::Rails::Engine
          engine_name "discourse_reputation"
          isolate_namespace DiscourseReputation
        end
    end

    module DiscourseReputation::DiscourseReputationAccess
        def self.get_user_badge_count_by_type(user_id, badge_type_id)
            cacheKey = "discourse_reputation_cache:get_user_badge_count_by_type:#{user_id}:#{badge_type_id}"
            cachedValue = Discourse.redis.get(cacheKey)
            if cachedValue
                cachedValue
            else
                sql = <<~SQL
                    SELECT COUNT(*)
                    FROM user_badges ub
                    LEFT JOIN badges b ON b.id = ub.badge_id
                    WHERE user_id = :user_id AND b.badge_type_id = :badge_type_id
                SQL
                calculatedValue = DB.query_single(sql, user_id: user_id, badge_type_id: badge_type_id)[0].to_i
                Discourse.redis.setex(cacheKey, SiteSetting.cache_in_minutes_user_badge_count.to_i.minutes.seconds, calculatedValue)
                calculatedValue
            end
        end
    end

    Discourse::Application.routes.append do
        # Map the path `/discourse-reputation` to `DiscourseReputationController`’s `index` method
        # Remove route if not in use
        get 'reputation-reports/bulk' => 'reputation_reports#bulk'
    end

    add_to_class(:user, :reputation_count) do
        reputationPost = Post.where(user_id: self.id).sum(:qa_reputation_count)
        reputationComment = QuestionAnswerComment.where(user_id: self.id).sum(:qa_reputation_count)
        reputation = SiteSetting.default_reputation + reputationPost + reputationComment
    end
    add_to_serializer(:current_user, :reputation_count) { object.reputation_count }
    add_to_serializer(:user_card, :reputation_count) { object.reputation_count }
    add_to_serializer(:post, :user_reputation_count) { object.user.reputation_count }

    add_to_class(:user, :gold_badge_count) { DiscourseReputation::DiscourseReputationAccess.get_user_badge_count_by_type(id, 1) }
    add_to_class(:user, :silver_badge_count) { DiscourseReputation::DiscourseReputationAccess.get_user_badge_count_by_type(id, 2) }
    add_to_class(:user, :bronze_badge_count) { DiscourseReputation::DiscourseReputationAccess.get_user_badge_count_by_type(id, 3) }
    add_to_serializer(:current_user, :gold_badge_count) { object.gold_badge_count }
    add_to_serializer(:current_user, :silver_badge_count) { object.silver_badge_count }
    add_to_serializer(:current_user, :bronze_badge_count) { object.bronze_badge_count }
    add_to_serializer(:user_card, :gold_badge_count) { object.gold_badge_count }
    add_to_serializer(:user_card, :silver_badge_count) { object.silver_badge_count }
    add_to_serializer(:user_card, :bronze_badge_count) { object.bronze_badge_count }
    add_to_serializer(:post, :user_gold_badge_count) { object.user.gold_badge_count }
    add_to_serializer(:post, :user_silver_badge_count) { object.user.silver_badge_count }
    add_to_serializer(:post, :user_bronze_badge_count) { object.user.bronze_badge_count }
end 