class Trade < ApplicationRecord
  belongs_to :league
  belongs_to :user
  belongs_to :team

  serialize :players_in
  serialize :players_out
  serialize :results
  
end
