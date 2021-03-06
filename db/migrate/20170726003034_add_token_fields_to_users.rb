class AddTokenFieldsToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :token, :text
    add_column :users, :expires_at, :string
    add_column :users, :refresh_token, :string
  end
end
