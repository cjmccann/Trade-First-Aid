class League < ApplicationRecord
  serialize :stat_settings

  belongs_to :user
  has_many :teams

  validates :game_id, presence: true
  validates :code, presence: true
  validates :league_id, presence: true
  validates :manager_id, presence: true

  def self.from_seasons(user, seasons)
    valid_nfl_teams = [ ]

    seasons.each do |season|
      next if season['season'] != '2016'

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

    #self.leagues.create(valid_nfl_teams)

    valid_nfl_teams.each do |team|
      league_temp = where(league_id: team[:league_id], manager_id: team[:manager_id], user_id: user.id).first_or_create do |league|
        league.game_id = team[:game_id]
        league.code = team[:code]
        league.league_id = team[:league_id]
        league.manager_id = team[:manager_id]
        league.user_id = user.id
        league.name = user.api_client.get_league_name(team[:game_id], team[:league_id])
        league.stat_settings = convert_stat_settings(user.api_client.get_league_settings(league.game_id, league.league_id))
      end

      Team.from_league_init(league_temp)
    end
  end

  def self.convert_stat_settings(data)
    stats = { }

    data['stat_categories']['stats']['stat'].each do |stat_hash|
      next if stat_hash['position_type'] == 'DT'

      stats[stat_hash['name']] = {
        enabled: stat_hash['enabled'],
        name: stat_hash['name'],
        display_name: stat_hash['display_name'],
        sort_order: stat_hash['sort_order'],
        position_type: stat_hash['position_type'],
        roto_names: @@yahoo_mappings[stat_hash['name']],
        stat_id: stat_hash['stat_id']
      }
    end

    data['stat_modifiers']['stats']['stat'].each do |stat_mod|
      stats.each do |key, value|
        if stat_mod['stat_id'] == value['stat_id']
          value[:modifier] = stat_mod['value']
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

  def stat_display_name(key)

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
end
