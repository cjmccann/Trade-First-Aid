class TradesController < ApplicationController
  skip_before_action :authenticate_user!, :only => [:demo]

  def new
    binding.pry
    @league = League.find(params['league_id'])
    @my_team = @league.teams.where( :user => current_user ).first
    @other_teams = @league.teams.where( :user => nil )

    if !@other_teams.first.imported
      @other_teams.first.import(current_user)
    end
  end

  def demo
    @league = League.where('league_id' => '995273').first
    @my_team = @league.teams[0]
    @other_teams = @league.teams.to_a.slice(0, @league.teams.length - 1)
    @demo = true
  end
end
