require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module TradeAnalyzer
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    sekrets = File.join(Rails.root, 'config', 'sekrets.yml.enc')
    config.sekrets = Sekrets.settings_for(sekrets)[Rails.env] || {}

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
    # config.action_dispatch.default_headers['X-Frame-Options'] = "ALLOW-FROM https://www.rotoballer.com"
    config.action_dispatch.default_headers["X-Content-Security-Policy"] = "frame-ancestors https://*.rotoballer.com";
    config.action_dispatch.default_headers["Content-Security-Policy"] = "frame-ancestors https://*.rotoballer.com";
  end
end
