class League < ApplicationRecord
  belongs_to :user
  has_many :teams

  validates :game_id, presence: true
  validates :code, presence: true
  validates :league_id, presence: true
  validates :manager_id, presence: true

  def self.from_seasons(user, seasons)
    valid_nfl_teams = [ ]

    seasons.each do |season|
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
      end

      Team.from_league_init(league_temp)
    end
  end

  def self.data_from_team_key(team_key)
    split_key = team_key.split('.')

    { league_key: split_key[2], manager_id: split_key[4] }
  end

  private
end
