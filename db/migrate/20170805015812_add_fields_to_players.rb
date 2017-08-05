class AddFieldsToPlayers < ActiveRecord::Migration[5.1]
  def change
    add_column :players, :icon_url, :string
    add_column :players, :player_id, :string
    add_column :players, :first_name, :string
    add_column :players, :last_name, :string
    add_column :players, :positions, :string, array: true, default: [].to_yaml
    add_column :players, :team_key, :string
    add_column :players, :team_abbr, :string
  end
end
