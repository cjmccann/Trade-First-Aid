class AddTeamStatsToLeagues < ActiveRecord::Migration[5.1]
  def change
    add_column :leagues, :stats, :text
  end
end
