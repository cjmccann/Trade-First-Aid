class AddNameToLeagues < ActiveRecord::Migration[5.1]
  def change
    add_column :leagues, :name, :string
  end
end
