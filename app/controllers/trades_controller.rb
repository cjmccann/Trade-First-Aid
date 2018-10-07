class TradesController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:demo]

  def new
    @league = League.find(trade_params['league_id'])
    @my_team = @league.teams.where( :user => current_user ).first
    @stat_metadata = @league.stat_metadata
    
    if trade_params['otherTeam'].nil?
      @other_team = @league.teams.where( :user => nil ).first

      if !@other_team.imported
        @other_team.import(current_user)
      end
    else
      @other_team = @league.teams.where( 'manager_id' => trade_params['otherTeam'] ).first
    end

    if trade_params['players']
      @traded_players = trade_params['players'].map(&:to_i)
    end
    
    if trade_params['targetPlayer']
      @added_player = trade_params['targetPlayer'].to_i
    end
  end

  def demo
    @league = League.where('league_id' => '590984').first

    if @league.nil?
      redirect_to root_path
      flash[:warning] = 'Demo league has not yet been loaded! Try again later.'
      return
    end

    @my_team = @league.teams.where.not(:user => nil).first
    @stat_metadata = @league.stat_metadata

    if trade_params['otherTeam'].nil?
      @other_team = @league.teams.where( :user => nil ).first
    else
      @other_team = @league.teams.where( 'manager_id' => trade_params['otherTeam'] ).first
    end

    if trade_params['players']
      @traded_players = trade_params['players'].map(&:to_i)
    end

    if trade_params['targetPlayer']
      @added_player = trade_params['targetPlayer'].to_i
    end

    @demo = true
  end

  private
    def trade_params
      params.permit(:league_id, :otherTeam, :targetPlayer, :players => [])
    end
end
