class AddIconUrlStringToTeam < ActiveRecord::Migration[5.1]
  def change
    add_column :teams, :icon_url, :string
  end
end
