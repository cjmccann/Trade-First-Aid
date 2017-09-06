class League < ApplicationRecord
  serialize :stat_settings
  serialize :player_stats
  serialize :team_stats
  serialize :unsupported_categories

  belongs_to :user
  has_many :teams
  has_many :trades
  has_many :transactions

  validates :game_id, presence: true
  validates :code, presence: true
  validates :league_id, presence: true
  validates :manager_id, presence: true

  def self.from_seasons(user, seasons)
    valid_nfl_teams = [ ]

    if seasons.is_a?(Hash)
      seasons = [ seasons ]
    end

    seasons.each do |season|
      next unless season['season'] == '2017' 

      if season['code'] == 'nfl'
        if season['teams']['team'].kind_of?(Array)
          team_array = season['teams']['team']
        else
          team_array = [ season['teams']['team'] ]
        end

        team_array.each do |team|
          team_data = data_from_team_key(team['team_key'])

          valid_nfl_teams.push({ game_id: season['game_id'], 
                                  code: season['code'], 
                                  league_id: team_data[:league_key],
                                  manager_id: team_data[:manager_id] 
          })
        end
      end
    end

    valid_nfl_teams.each do |team|
      league_temp = where(league_id: team[:league_id].to_i, manager_id: team[:manager_id].to_i, user_id: user.id).first_or_create do |league|
        league.game_id = team[:game_id]
        league.code = team[:code]
        league.league_id = team[:league_id]
        league.manager_id = team[:manager_id]
        league.user_id = user.id
        league.name = user.api_client.get_league_name(team[:game_id], team[:league_id])
        league.unsupported_categories = [ ]
        league.stat_settings = convert_stat_settings(league, user.api_client.get_league_settings(league.game_id, league.league_id))
        league.week_updated = get_current_week
        league.synced_at = DateTime.now
      end

      teams = user.api_client.get_league_teams(league_temp.game_id, league_temp.league_id)

      if teams.is_a?(Hash)
        teams = [ teams ]
      end

      teams.each do |team_data|
        Team.from_yahoo_league_init(league_temp, team_data)
      end
    end
  end

  def self.get_current_week
    RotoTimeframe.where( 'SeasonType' => 1, 'Season' => 2017 )
      .where("DATE(EndDate) >= ?", Time.now.utc.to_date)
      .order('StartDate' => :asc).first['Week']
  end

  def self.convert_stat_settings(league, data)
    stats = { }

    data['stat_categories']['stats']['stat'].each do |stat_hash|
      next if stat_hash['position_type'] == 'DT' || stat_hash['position_type'] == 'K'

      if (@@yahoo_unsupported[stat_hash['name']])
        league.unsupported_categories.push(stat_hash['name'])
        next
      end

      stats[stat_hash['display_name']] = {
        enabled: stat_hash['enabled'],
        name: stat_hash['name'],
        display_name: stat_hash['display_name'],
        sort_order: stat_hash['sort_order'],
        position_type: stat_hash['position_type'],
        roto_names: @@yahoo_mappings[stat_hash['name']],
        stat_id: stat_hash['stat_id'],
        is_display_stat: stat_hash['is_only_display_stat'] == '1' ? true : false
      }
    end

    data['stat_modifiers']['stats']['stat'].each do |stat_mod|
      stats.each do |key, value|
        if stat_mod['stat_id'] == value[:stat_id]
          value[:modifier] = stat_mod['value'].to_f

          if value[:modifier] == 0
            value[:is_display_stat] = true
          end

          stat_mod['bonuses'].nil? ? value[:bonuses] = [] : value[:bonuses] = stat_mod['bonuses']['bonus']
        end
      end
    end 

    stats
  end

  def self.data_from_team_key(team_key)
    split_key = team_key.split('.')

    { league_key: split_key[2], manager_id: split_key[4] }
  end

  def self.yahoo_mappings
    @@yahoo_mappings
  end

  def calculate_team_stats(starting_week)
    stats = [ ]

    self.teams.each do |team|
      players = RotoPlayerGameProjection.where('PlayerID' => team.rotoplayer_arr, 
                                               'Season' => 2017, 
                                               'Week' => (starting_week)..17)

      team_stats = { 'name' => team.name }
      total_points = 0.0

      self.stat_settings.each do |key, data|
        next if data[:roto_names].nil?       

        total = 0.0

        players.each do |player|
          value = data[:roto_names].reduce(0.0) { |base, roto_key| base += player[roto_key] }
          next if value == 0.0

          unless data[:modifier].nil? || data[:modifier] == 0
            total_points += (value * data[:modifier])
          end

          total += value 
        end

        team_stats[key] = total
      end

      team_stats['total'] = total_points
      team_stats['teamIcon'] = team.icon_url

      stats.push(team_stats)
    end

    self.team_stats = round_team_stats(stats)
  end

  def calculate_player_stats(starting_week)
    stats = { }

    self.teams.each do |team|
      players = RotoPlayerGameProjection.where('PlayerID' => team.rotoplayer_arr, 
                                               'Season' => 2017, 
                                               'Week' => (starting_week)..17)
      
      players.each do |player|
        if stats[player.PlayerID].nil?
          player_stats = { }
          total_value = 0.0
        else
          player_stats = stats[player.PlayerID]
          total_value = player_stats['total']
        end


        self.stat_settings.each do |key, data|
          next if data[:roto_names].nil?

          value = data[:roto_names].reduce(0.0) { |base, roto_key| base += player[roto_key] }
          next if value == 0.0
          
          unless data[:modifier].nil? || data[:modifier] == 0
            total_value += (value * data[:modifier])
          end

          if player_stats[key].nil?
            player_stats[key] = value
          else
            player_stats[key] = (player_stats[key] + value)
          end
        end

        player_stats['total'] = total_value
        stats[player.PlayerID] = player_stats
      end
    end

    self.player_stats = round_player_stats(stats)
  end

  def round_team_stats(stats)
    stats.each do |team|
      team.each do |k, v|
        if v.is_a?(Numeric)
          digits = (k == 'total' ? 1 : 0)
          team[k] = v.round(digits)
        end
      end
    end
  end

  def round_player_stats(stats)
    stats.each do |k, v|
      v.each do |k2, v2|
        if v2.is_a?(Numeric)
          digits = (k2 == 'total' ? 1 : 0)
          v[k2] = v2.round(digits)
        end
      end
    end
  end

  def sync_now?
    !self.synced_at.today? || (self.week_updated != League.get_current_week)
  end

  def sync(force)
    teams = self.user.api_client.get_league_teams(self.game_id, self.league_id)
    tx_data = { }

    if teams.is_a?(Hash)
      teams = [ teams ]
    end

    teams.each do |team|
      Team.sync(self, team, tx_data)
    end

    league_updated = Transaction.from_sync(self, tx_data)

    # in the event the league has been updated, or we've passed into a new week,
    # update player and team stats, and refresh appropriate datetimes
    if force || league_updated || (self.week_updated != League.get_current_week)
      self.week_updated = League.get_current_week

      calculate_player_stats(self.week_updated)
      calculate_team_stats(self.week_updated)
      league_updated = true
    end

    # Even if no updates, register that league has been synced today
    self.synced_at = DateTime.now
    self.save

    league_updated
  end

  def team_id_map
    map = { }
    self.teams.each do |team|
      map[team.name] = team.id
    end
    
    map
  end

  def get_negative_stats
    ['Int', 'Fum', 'Fum Lost']
    #self.stat_settings.each do |k, v|
    #  if !v[:modifier].nil? && v[:modifier] < 0
    #    stats.push(k)
    #  end
    #end
  end

  private
    # Yahoo unsupported settings: Incomplete Passes, Pick Sixes Thrown, Passing 1st downs, 40+ yd completions, 40+ yd passing touchdowns,
    # Rushing 1st downs, 40+ yard run, 40+ yard rushing touchdowns, 40+ Yard Receptions, 40+ Yard Receiving Touchdowns, Field Goals Missed 0-19 Yards...,
    # Point After Attempt Missed, all defensive categories, Offensive Fumble Return TD
  
    @@yahoo_mappings = { 
      'Passing Attempts' => ['PassingAttempts'],
      'Completions' => ['PassingCompletions'],
      'Passing Yards' => ['PassingYards'],
      'Passing Touchdowns' => ['PassingTouchdowns'],
      'Interceptions' => ['PassingInterceptions'],
      'Sacks' => ['PassingSacks'],
      'Rushing Attempts' => ['RushingAttempts'],
      'Rushing Yards' => ['RushingYards'],
      'Rushing Touchdowns' => ['RushingTouchdowns'],
      'Targets' => ['ReceivingTargets'],
      'Receptions' => ['Receptions'],
      'Receiving Yards' => ['ReceivingYards'],
      'Receiving Touchdowns' => ['ReceivingTouchdowns'],
      'Return Yards' => ['PuntReturnYards', 'KickReturnYards'],
      'Return Touchdowns' => ['PuntReturnTouchdowns', 'KickReturnTouchdowns'],
      '2-Point Conversions' => ['TwoPointConversionPasses', 'TwoPointConversionRuns', 'TwoPointConversionReceptions'],
      'Field Goals 0-19 Yards' => ['FieldGoalsMade0to19'],
      'Field Goals 20-29 Yards' => ['FieldGoalsMade20to29'],
      'Field Goals 30-39 Yards' => ['FieldGoalsMade30to39'],
      'Field Goals 40-49 Yards' => ['FieldGoalsMade40to49'],
      'Field Goals 50+ Yards' => ['FieldGoalsMade50Plus'],
      'Point After Attempt Made' => ['ExtraPointsMade'],
      'Fumbles' => ['Fumbles'],
      'Fumbles Lost' => ['FumblesLost'],
    }

    @@yahoo_unsupported = {
      'Incomplete Passes' => true,
      'Pick Sixes Thrown' => true,
      'Sacks' => true,
      'Passing 1st Downs' => true,
      '40+ Yard Completions' => true,
      '40+ Yard Passing Touchdowns' => true,
      'Rushing 1st Downs' => true,
      '40+ Yard Run' => true,
      '40+ Yard Rushing Touchdowns' => true,
      'Return Yards' => true,
      'Return Touchdowns' => true,
      'Receiving 1st Downs' => true,
      '40+ Yard Receptions' => true,
      '40+ Yard Receiving Touchdowns' => true,
      '2-Point Conversions' => true,
      'Offensive Fumble Return TD' => true
    }
end
