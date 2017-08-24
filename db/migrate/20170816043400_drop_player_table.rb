class DropPlayerTable < ActiveRecord::Migration[5.1]
  def change
    remove_column :teams, :player_arr
  end
end
