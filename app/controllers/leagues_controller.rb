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

    league.calculate_player_stats(league.week_updated)
    league.calculate_team_stats(league.week_updated)
    league.save

    my_team = league.teams.where( 'manager_id' => league.manager_id )[0]
    
    if (league.unsupported_categories.length > 0)
      flash[:warning] = "#{league.name} uses the following categories which are not " +
        "included in the projection systems used. These categories will not be shown when projecting trade outcomes." + 
        "<span class='unsupported'><ul><li>" + league.unsupported_categories.join(', ') + '</li></ul></span>'
      flash[:html_safe] = true
    end

    redirect_to my_team
  end

  def sync 
    league = League.find(params[:id])
    force = params['force'] == 'true'

    if league.sync(force)
      render :json => { :status => 'update' }
    else
      render :json => { :status => 'no-update' }
    end
  end

end
