class TeamsController < ApplicationController
  def show
    @team = Team.find(params[:id])
    @sync_success = true if params['synced']
  end
  
  def set_favorite
    team = Team.find(params[:team_id])
    team.user.favorite_team = team.id
    team.user.save
  end
end
