# name: Discourse reputation
# about: Description for this plugin
# version: 0.1.0
# authors: Tu Dinh Tu
# url:

enabled_site_setting :discourse_reputation_enabled

PLUGIN_NAME ||= 'discourse_reputation'.freeze
register_asset 'stylesheets/discourse-reputation.scss'
after_initialize do
    # load File.expand_path('../app/controllers/discourse_reputation_controller.rb', __FILE__)
    load File.expand_path('../app/lib/post_voting/vote_manager.rb', __FILE__)

    Discourse::Application.routes.append do
        # Map the path `/discourse-reputation` to `DiscourseReputationController`’s `index` method
        # Remove route if not in use
        # get '/discourse-reputation' => 'discourse_reputation#index'
    end

    add_to_class(:user, :reputation_count) { Post.where(user_id: self.id).sum(:qa_reputation_count) }
    add_to_serializer(:user_card, :reputation_count) { object.reputation_count }
    add_to_serializer(:post, :user_reputation_count) { Post.where(user_id: object.user_id).sum(:qa_reputation_count) }
end 