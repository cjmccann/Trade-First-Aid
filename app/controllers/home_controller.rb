class HomeController < ApplicationController
  def index
    if current_user.leagues.empty?
      current_user.initialize_leagues
    end

    if current_user.favorite_team.nil?

    end

    @user = current_user
    @leagues = current_user.leagues
    @favorite_team = current_user.favorite_team if !current_user.favorite_team.nil?
  end
end
