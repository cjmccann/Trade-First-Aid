class TeamsController < ApplicationController
  def show
    @team = Team.find(team_params[:id])
    @sync_success = true if team_params['synced']
  end
  
  def set_favorite
    team = Team.find(team_params[:team_id])
    team.user.favorite_team = team.id
    team.user.save
  end

  private
    def team_params
      params.permit(:id, :team_id)
    end
end
