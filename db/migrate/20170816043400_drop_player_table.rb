class DropPlayerTable < ActiveRecord::Migration[5.1]
  def change
    drop_table :players

    remove_column :teams, :player_arr
  end
end
