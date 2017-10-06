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
        my_manager = nil

        if team_data['managers']['manager'].is_a?(Array)
          team_data['managers']['manager'].each do |manager|
            if manager['is_current_login'] == '1' 
              my_manager = manager
            end
          end
        else
          my_manager = team_data['managers']['manager']
        end
        
        if (team.user.email.empty? || team.user.email.nil?) && !my_manager['email'].nil?
          team.user.email = my_manager['email']
          team.user.save
        end
      end
    end
  end

  def self.sync(league, team_data, tx_data)
    team = Team.where( league_id: league.id, manager_id: team_data['team_id'].to_i).first
    tx_data['players'] = { } if tx_data['players'].nil?
    tx_data[team.id] = { }
    
    if team.name != team_data['name']
      team.name = team_data['name']
      tx_data[team.id]['name'] = team_data['name']
    end

    if team.icon_url != team_data['team_logos']['team_logo']['url']
      team.icon_url = team_data['team_logos']['team_logo']['url']
      tx_data[team.id]['icon'] = team_data['team_logos']['team_logo']['url']
    end

    player_data = league.user.api_client.get_all_players_from_team(league.game_id, league.league_id, team.manager_id)
    yahoo_ids = []
    players_to_remove = []
    new_rotoplayer_set = Set.new

    player_data.each do |player|
      next if player['position_type'] == 'DT' || player['position_type'] == 'K'

      yahoo_ids.push(player['player_id'])
    end

    RotoPlayer.where( 'YahooPlayerID' => yahoo_ids ).each do |rotoplayer|
      new_rotoplayer_set.add(rotoplayer.PlayerID)
      
      if !team.player_metadata.has_key?(rotoplayer.PlayerID)
        team.rotoplayer_arr.push(rotoplayer.PlayerID)
        team.player_metadata[rotoplayer.PlayerID] = { 'photo' => rotoplayer.PhotoUrl, 
                                                      'team' => rotoplayer.Team,
                                                      'bye_week' => rotoplayer.ByeWeek,
                                                      'name' => rotoplayer.Name,
                                                      'position' => rotoplayer.Position
        }
        tx_data['players'][rotoplayer.PlayerID] = { } if tx_data['players'][rotoplayer.PlayerID].nil?
        tx_data['players'][rotoplayer.PlayerID][:add] = team.id
      end
    end

    team.rotoplayer_arr.each do |roto_id|
      if !new_rotoplayer_set.include?(roto_id)
        players_to_remove.push(roto_id)
      end
    end

    players_to_remove.each do |roto_id|
      team.rotoplayer_arr.delete(roto_id)
      team.player_metadata.delete(roto_id)
      tx_data['players'][roto_id] = { } if tx_data['players'][roto_id].nil?
      tx_data['players'][roto_id][:drop] = team.id
    end

    team.save
  end

  def import(user)
    return true if self.imported

    if add_all_players(user)
      self.imported = true

      if (self.manager_id == self.league.manager_id) && user.favorite_team.nil?
        user.favorite_team = self.id
        user.save
      end
      
      self.save

      true
    else
      false
    end
  end

  def add_all_players(user)
    data = user.api_client.get_all_players_from_team(self.league.game_id, self.league.league_id, self.manager_id)

    if data == []
      return false
    end

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
                                                    'position' => rotoplayer.Position,
                                                    'benched' => false,
                                                    'flex' => false,
                                                    'flex_pos' => nil
      }
    end

    true
  end

  def set_benched_players(stats)
    point_order = []
    position_settings = self.league.position_settings.clone

    self.rotoplayer_arr.each do |id|
      if stats[id].nil?
        point_order.push({ id: id, val: 0 })
      else
        point_order.push({ id: id, val: stats[id]['total'] })
      end
    end
    
    point_order.sort! { |a, b|  -(a[:val] <=> b[:val]) }


    point_order.each do |obj|
      cur_pos = self.player_metadata[obj[:id]]['position']

      if position_settings[cur_pos] && position_settings[cur_pos] > 0
        position_settings[cur_pos] -= 1
        self.player_metadata[obj[:id]]['benched'] = false

      elsif available_flex?(position_settings, cur_pos)
        flex_slot = get_flex_slot(position_settings, cur_pos)
        position_settings[flex_slot] -= 1
        self.player_metadata[obj[:id]]['flex'] = true
        self.player_metadata[obj[:id]]['flex_pos'] = flex_slot
        self.player_metadata[obj[:id]]['benched'] = false

      else
        self.player_metadata[obj[:id]]['benched'] = true
      end
    end

    self.save
  end

  def get_sorted_players
    sorted_list = []
    stats = self.league.player_stats

    self.rotoplayer_arr.each do |id|
      sorted_list.push({ id: id, val: stats[id]['total'], pos: self.player_metadata[id]['position'], benched: self.player_metadata[id]['benched'] })
    end
    
    sorted_list.sort! { |a, b|  -(a[:val] <=> b[:val]) }
  end

  def available_flex?(settings, cur_pos)
    case cur_pos
    when 'WR'
      return true if settings['W/T'] > 0 || settings['W/R'] > 0 || settings['W/R/T'] > 0 || settings['Q/W/R/T'] > 0
    when 'RB'
      return true if settings['W/R'] > 0 || settings['W/R/T'] > 0 || settings['Q/W/R/T'] > 0
    when 'TE'
      return true if settings['W/T'] > 0 || settings['W/R/T'] > 0 || settings['Q/W/R/T'] > 0
    when 'QB'
      return true if settings['Q/W/R/T'] > 0
    end

    false
  end

  def get_flex_slot(settings, cur_pos)
    case cur_pos
    when 'WR'
      if settings['W/T'] > 0
        return 'W/T'
      elsif settings['W/R'] > 0
        return 'W/R'
      elsif settings['W/R/T'] > 0
        return 'W/R/T'
      elsif settings['Q/W/R/T'] > 0
        return 'Q/W/R/T'
      else
        return nil
      end
    when 'RB'
      if settings['W/R'] > 0
        return 'W/R'
      elsif settings['W/R/T'] > 0
        return 'W/R/T'
      elsif settings['Q/W/R/T'] > 0
        return 'Q/W/R/T'
      else
        return nil
      end
    when 'TE'
      if settings['W/T'] > 0
        return 'W/T'
      elsif settings['W/R/T'] > 0
        return 'W/R/T'
      elsif settings['Q/W/R/T'] > 0
        return 'Q/W/R/T'
      else
        return nil
      end
    when 'QB'
      if settings['Q/W/R/T'] > 0
        return 'Q/W/R/T'
      else
        return nil
      end
    end
  end

  def get_benched_players
    players = []

    self.player_metadata.each do |k, v|
      players.push(k) if v['benched']
    end

    players
  end

  def get_player_positions
    players = { }

    self.rotoplayer_arr.each do |id|
      data = self.player_metadata[id]

      if data['benched']
        players[id] = data['position'] + ' (BN)'
      elsif data['flex']
        players[id] = data['flex_pos']
      else
        players[id] = data['position']
      end
    end
    
    players
  end
end
