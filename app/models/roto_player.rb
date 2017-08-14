class RotoPlayer < ActiveRecord::Base
  establish_connection :rotoballer
  self.table_name = 'Player'
end
