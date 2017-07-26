module Yahoo
  class Client < OAuth2::Client
    def initialize
      super(
        Rails.application.secrets.YAHOO_APP_ID,
        Rails.application.secrets.YAHOO_APP_SECRET,
        :site => 'https://fantasysports.yahooapis.com',
        :parse_json => true
      )
    end
  end

  class Token < OAuth2::AccessToken
    def initialize(token, expires_at, refresh_token)
      super(
        Yahoo::Client.new,
        token,
        :expires_at => expires_at,
        :refresh_token => refresh_token
      )
    end
  end

  class API

  end
end
