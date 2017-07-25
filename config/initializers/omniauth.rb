require File.join(Rails.root, 'lib', 'strategies', 'yahoo_oauth2.rb')

Rails.application.config.middleware.use OmniAuth::Builder do
  strategy = Devise.omniauth_configs[:yahoo_oauth2].strategy

  provider :yahoo_oauth2, strategy["client_id"], strategy["client_secret"],
    name: 'yahoo'
end
