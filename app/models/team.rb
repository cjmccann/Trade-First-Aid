class Team < ApplicationRecord
  belongs_to :league
  belongs_to :user, optional: true

  serialize :player_arr
  serialize :rotoplayer_arr

  def self.from_yahoo_league_init(league, team_data)
    where(league_id: league.id, manager_id: team_data['team_id']).first_or_create do |team|
      # team_data = league.user.api_client.get_team_metadata(league.game_id, league.league_id, league.manager_id)

      team.name = team_data['name']
      team.icon_url = team_data['team_logos']['team_logo']['url']
      team.manager_id = team_data['team_id']
      team.league_id = league.id
      team.imported = false
      team.player_arr = []
      team.rotoplayer_arr = []

      if (team_data['team_id'].to_i == league.manager_id)
        team.user = league.user

        if (team.user.email.empty? || team.user.email.nil?) && !team_data['managers']['manager']['email'].nil?
          team.user.email = team_data['managers']['manager']['email']
          team.user.save
        end
      end
    end
  end

  def import(user)
    self.imported = true
    
    if user.favorite_team.nil?
      user.favorite_team = self.id
      user.save
    end

    add_all_players(user)

    self.save
  end

  def add_all_players(user)
    data = user.api_client.get_all_players_from_team(self.league.game_id, self.league.league_id, self.manager_id)

    data.each do |player|
      next if player['display_position'] == 'DEF'

      player = Player.from_yahoo_team_init(self, player)
      self.player_arr.push(player.id)
      self.rotoplayer_arr.push(player.roto_id)
    end
  end
end
