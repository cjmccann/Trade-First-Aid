class AddStatSettingsToLeageuAndStatsToPlayer < ActiveRecord::Migration[5.1]
  def change
    add_column :leagues, :stat_settings, :text
  end
end
