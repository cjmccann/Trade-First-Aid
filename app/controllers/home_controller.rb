class HomeController < ApplicationController
  def index
    if current_user
      if current_user.leagues.empty?
        current_user.initialize_leagues
      end

      @team = Team.find(current_user.favorite_team) if !current_user.favorite_team.nil?

    else
      @demo_league = League.where( league_id: '995273').first
    end
  end
end
