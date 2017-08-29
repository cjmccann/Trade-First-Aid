class Team < ApplicationRecord
  belongs_to :league
  belongs_to :user, optional: true

  serialize :rotoplayer_arr
  serialize :player_metadata

  def self.from_yahoo_league_init(league, team_data)
    where(league_id: league.id, manager_id: team_data['team_id'].to_i).first_or_create do |team|
      # team_data = league.user.api_client.get_team_metadata(league.game_id, league.league_id, league.manager_id)

      team.name = team_data['name']
      team.icon_url = team_data['team_logos']['team_logo']['url']
      team.manager_id = team_data['team_id']
      team.league_id = league.id
      team.imported = false
      team.rotoplayer_arr = []
      team.player_metadata = {}

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
    
    if (self.manager_id == self.league.manager_id) && user.favorite_team.nil?
      user.favorite_team = self.id
      user.save
    end

    add_all_players(user)

    self.save
  end

  def add_all_players(user)
    data = user.api_client.get_all_players_from_team(self.league.game_id, self.league.league_id, self.manager_id)
    yahoo_ids = []

    data.each do |player|
      next if player['position_type'] == 'DT' || player['position_type'] == 'K'

      yahoo_ids.push(player['player_id'])
    end

    RotoPlayer.where( 'YahooPlayerID' => yahoo_ids ).each do |rotoplayer|
      self.rotoplayer_arr.push(rotoplayer.PlayerID)
      self.player_metadata[rotoplayer.PlayerID] = { 'photo' => rotoplayer.PhotoUrl, 
                                                    'team' => rotoplayer.Team,
                                                    'bye_week' => rotoplayer.ByeWeek,
                                                    'name' => rotoplayer.Name,
                                                    'position' => rotoplayer.Position
      }
    end
  end

end
