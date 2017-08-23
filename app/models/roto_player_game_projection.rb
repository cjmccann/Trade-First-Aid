class RotoPlayerGameProjection < ActiveRecord::Base
  establish_connection :rotoballer
  self.table_name = 'PlayerGameProjection'
end
