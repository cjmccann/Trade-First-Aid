class TeamsController < ApplicationController
  def show
    @team = Team.find(params[:id])
  end

  def import
    team = Team.find(params[:id])

    team.import
    redirect_to team
  end
end
