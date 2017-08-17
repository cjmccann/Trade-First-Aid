class AddPlayerMetadataToLeague < ActiveRecord::Migration[5.1]
  def change
    add_column :leagues, :player_metadata, :text
  end
end
