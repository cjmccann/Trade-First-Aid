class Player < ApplicationRecord
  serialize :positions
  serialize :cur_stats

  def self.from_team_init(team, data)
    
    where(player_id: data['player_id'], yahoo_id: data['player_key']).first_or_create do |player|
      player.player_id = data['player_id']
      player.yahoo_id = data['player_key']
      player.name = data['name']['full']
      player.first_name = data['name']['first']
      player.last_name = data['name']['last']
      player.icon_url = data['headshot']['url']
      player.positions = data['eligible_positions']['position']
      player.team_key = data['editorial_team_key']
      player.team_abbr = data['editorial_team_abbr']

      stats = { }
      team.user.api_client.get_player_stats(player.yahoo_id).each do |stat_data|
        stats[stat_data['stat_id']] = stat_data['value']
      end

      player.cur_stats = stats
    end
  end
end
