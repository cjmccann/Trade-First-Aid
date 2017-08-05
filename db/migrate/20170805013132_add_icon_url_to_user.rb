class AddIconUrlToUser < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :icon_url, :string
  end
end
