class TradesController < ApplicationController
  def new
    league = League.find(params['league_id'])
    @my_team = league.teams.where( :user => current_user ).first
    @other_teams = league.teams.where( :user => nil )

    if !@other_teams.first.imported
      @other_teams.first.import(current_user)
    end
  end
end
