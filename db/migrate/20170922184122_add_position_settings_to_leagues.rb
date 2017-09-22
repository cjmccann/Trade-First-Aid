class AddPositionSettingsToLeagues < ActiveRecord::Migration[5.1]
  def change
    add_column :leagues, :position_settings, :text
  end
end
