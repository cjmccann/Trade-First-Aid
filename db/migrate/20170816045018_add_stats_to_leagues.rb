class AddStatsToLeagues < ActiveRecord::Migration[5.1]
  def change
    remove_column :leagues, :stats

    add_column :leagues, :player_stats, :text
    add_column :leagues, :team_stats, :text
  end
end
