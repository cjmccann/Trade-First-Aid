class TradesController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:demo]

  def new
    @league = League.find(params['league_id'])
    @my_team = @league.teams.where( :user => current_user ).first

    if params['otherTeam'].nil?
      @other_team = @league.teams.where( :user => nil ).first

      if !@other_team.imported
        @other_team.import(current_user)
      end
    else
      @other_team = @league.teams.where( 'manager_id' => params['otherTeam'] ).first
    end

    if params['players']
      @traded_players = params['players'].map(&:to_i)
    end
  end

  def demo
    @league = League.where('league_id' => '995273').first
    @my_team = @league.teams.where.not(:user => nil).first

    if params['otherTeam'].nil?
      @other_team = @league.teams.where( :user => nil ).first
    else
      @other_team = @league.teams.where( 'manager_id' => params['otherTeam'] ).first
    end

    if params['players']
      @traded_players = params['players'].map(&:to_i)
    end

    @demo = true
  end
end
