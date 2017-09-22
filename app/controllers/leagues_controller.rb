class LeaguesController < ApplicationController
  def new
  end

  def create
  end

  def index
      current_user.initialize_leagues
  end

  def import
    league = League.find(league_params[:id])

    league.teams.each do |team|
      success = team.import(current_user)

      if !success
        flash[:warning] = "Team #{team.name} has no players. Import failed. Ensure #{league.name} has drafted and try again."
        redirect_to leagues_path
        return
      end
    end

    league.calculate_player_stats(league.week_updated)
    set_benched_players(league.player_stats)
    league.calculate_team_stats(league.week_updated)
    league.save

    my_team = league.teams.where( 'manager_id' => league.manager_id )[0]
    
    if (league.unsupported_categories.length > 0)
      flash[:warning] = "#{league.name} uses the following categories which are not " +
        "included in the projection systems used. These categories will not be shown when projecting trade outcomes." + 
        "<span class='unsupported'><ul class='text-center unsupported-list'><li>" + league.unsupported_categories.join(', ') + '</li></ul></span>'
      flash[:html_safe] = true
    end

    redirect_to my_team
  end

  def sync 
    league = League.find(league_params[:id])
    force = league_params['force'] == 'true'

    if league.sync(force)
      render :json => { :status => 'update' }
    else
      render :json => { :status => 'no-update' }
    end
  end

  private
    def league_params
      params.permit(:force, :id)
    end
end
