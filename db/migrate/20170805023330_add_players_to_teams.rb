class AddPlayersToTeams < ActiveRecord::Migration[5.1]
  def change
    remove_column :players, :positions

    add_column :players, :positions, :text
    add_column :teams, :player_arr, :text
  end
end
