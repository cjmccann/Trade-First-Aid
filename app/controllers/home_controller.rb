class HomeController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:index]

  def index
    if current_user
      if current_user.leagues.empty?
        current_user.initialize_leagues
      end

      @team = Team.find(current_user.favorite_team) if !current_user.favorite_team.nil?

      if @team && @team.league && @team.league.player_stats.nil?
        @team.league.sync(true)
      end

      @sync_success = true if home_params['synced'] == 'true'
    else
      @demo_league = League.where( league_id: '995273').first
    end
  end

  private
    def home_params
      params.permit(:synced)
    end
end
