class AddPlayerMetadataToTeamRemoveFromLeague < ActiveRecord::Migration[5.1]
  def change
    remove_column :leagues, :player_metadata

    add_column :teams, :player_metadata, :text
  end
end
