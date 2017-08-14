class Team < ApplicationRecord
  serialize :player_arr
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
      team.player_arr = []

      if (team.user.email.empty? || team.user.email.nil?) && !team_data['managers']['manager']['email'].nil?
        team.user.email = team_data['managers']['manager']['email']
        team.user.save
      end
    end
  end

  def import
    self.imported = true
    
    if self.user.favorite_team.nil?
      self.user.favorite_team = self.id
      self.user.save
    end

    add_all_players

    self.save
  end

  def add_all_players
    data = self.user.api_client.get_all_players_from_team(self.league.game_id, self.league.league_id, self.league.manager_id)

    data.each do |player|
      next if player['display_position'] == 'DEF'

      player = Player.from_yahoo_team_init(self, player)
      self.player_arr.push(player.id)
    end
  end
end
