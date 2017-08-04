class Team < ApplicationRecord
  belongs_to :league
  def self.from_league_init(league)
    where(league_id: league.id, manager_id: league.manager_id).first_or_create do |team|
      team_data = league.user.api_client.get_team_metadata(league.game_id, league.league_id, league.manager_id)

      team.name = team_data['name']
      team.icon_url = team_data['team_logos']['team_logo']['url']
      team.manager_id = league.manager_id
      team.league_id = league.id
    end
  end
end
