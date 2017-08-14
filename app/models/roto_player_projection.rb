class RotoPlayerProjection < ActiveRecord::Base
  establish_connection :rotoballer
  self.table_name = 'PlayerSeasonProjection'
end
