class LeaguesController < ApplicationController
  def new
  end

  def create
  end

  def index
  end

  def import
    league = League.find(params[:id])

    league.teams.each do |team|
      team.import(current_user)
    end

    league.calculate_player_stats
    league.calculate_team_stats
    league.save

    my_team = league.teams.where( 'manager_id' => league.manager_id )[0]
    redirect_to my_team
  end
end
