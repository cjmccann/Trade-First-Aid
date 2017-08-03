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

  class APIClient
    @@cache = { }

    GAMES_URL = '/fantasy/v2/users;use_login=1/games'
    SEASONS_URL = '/fantasy/v2/users;use_login=1/games/teams' 

    def self.get(user)
      if @@cache[user.username.hash].nil?
        @@cache[user.username.hash] = APIClient.new(user)
      else
        @@cache[user.username.hash]
      end
    end

    def initialize(user)
      @oauth_token = Yahoo::Token.new(user.token, user.expires_at, user.refresh_token)
      @username = user.username
    end

    def refresh_token_if_expired
      if token_expired?
        @oauth_token.refresh!

        # TODO: Update user's properties w/ new token here??
      end
    end

    def token_expired?
      expiry = Time.at(@oauth_token.expires_at)
      expiry < Time.now ? true : false
    end

    def get_games_list
      refresh_token_if_expired

      get_hash_response(GAMES_URL)
      binding.pry
    end

    def get_user_seasons 
      refresh_token_if_expired

      data = get_hash_response(SEASONS_URL)
      data['fantasy_content']['users']['user']['games']['game']
    end

    def get_league_name(game_id, league_id)
      refresh_token_if_expired

      data = get_hash_response("fantasy/v2/league/#{game_id}.l.#{league_id}")

      data['fantasy_content']['league']['name']
    end

    def get_league_settings(game_id, league_id)
      refresh_token_if_expired

      data = get_hash_response("fantasy/v2/league/#{game_id}.l.#{league_id}/settings")
      binding.pry
    end

    def get_team_metadata(game_id, league_id, manager_id)
      refresh_token_if_expired

      data = get_hash_response("fantasy/v2/team/#{game_id}.l.#{league_id}.t.#{manager_id}")
      binding.pry
    end

    def get_team_stats(game_id, league_id, manager_id)
      refresh_token_if_expired

      data = get_hash_response("fantasy/v2/team/#{game_id}.l.#{league_id}.t.#{manager_id}/stats;type=week;week=2")
      binding.pry
    end

    def get_all_players_from_team(game_id, league_id, manager_id)
      refresh_token_if_expired

      data = get_hash_response("fantasy/v2/team/#{game_id}.l.#{league_id}.t.#{manager_id}/players")
      binding.pry
    end

    def get_player_stats
      refresh_token_if_expired

      data = get_hash_response("fantasy/v2/player/348.p.6791/stats")
      binding.pry
    end

    def get_hash_response(url)
      doc = Nokogiri::XML(@oauth_token.get(url).response.body)
      Hash.from_xml(doc.to_s)
    end

  end
end
