class AddRotoplayerArrToTeam < ActiveRecord::Migration[5.1]
  def change
    add_column :teams, :rotoplayer_arr, :text
  end
end
