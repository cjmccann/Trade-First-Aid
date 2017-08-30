class TeamsController < ApplicationController
  def show
    @team = Team.find(params[:id])
    @sync_success = true if params['synced']
  end
end
