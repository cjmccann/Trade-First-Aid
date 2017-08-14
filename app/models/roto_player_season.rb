class RotoPlayerSeason < ActiveRecord::Base
  establish_connection :rotoballer
  self.table_name = 'PlayerSeason'
end
