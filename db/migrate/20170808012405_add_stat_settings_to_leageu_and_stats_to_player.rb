class AddStatSettingsToLeageuAndStatsToPlayer < ActiveRecord::Migration[5.1]
  def change
    add_column :players, :cur_stats, :text
    add_column :leagues, :stat_settings, :text
  end
end
