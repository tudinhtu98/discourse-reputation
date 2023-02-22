# name: plugin-name
# about: Description for this plugin
# version: 0.1.0
# authors: Tu Dinh Tu
# url:

enabled_site_setting :name_enabled

register_asset 'stylesheets/name.scss'

after_initialize do
    load File.expand_path('../app/controllers/name_controller.rb', __FILE__)

    Discourse::Application.routes.append do
        # Map the path `/name` to `NameController`’s `index` method
        # Remove route if not in use
        get '/name' => 'name#index'
    end
end