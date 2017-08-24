class AddPlayersToTeams < ActiveRecord::Migration[5.1]
  def change
    add_column :teams, :player_arr, :text
  end
end
