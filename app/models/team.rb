class Team < ApplicationRecord
  belongs_to :league
  belongs_to :user

  def self.from_league_init(league)
    where(league_id: league.id, manager_id: league.manager_id).first_or_create do |team|
      team_data = league.user.api_client.get_team_metadata(league.game_id, league.league_id, league.manager_id)

      team.name = team_data['name']
      team.icon_url = team_data['team_logos']['team_logo']['url']
      team.manager_id = league.manager_id
      team.league_id = league.id
      team.imported = false
      team.user = league.user
    end
  end

  def import
    self.imported = true
    
    if self.user.favorite_team.nil?
      self.user.favorite_team = self.id
    end

    self.user.save
    self.save
  end
end
