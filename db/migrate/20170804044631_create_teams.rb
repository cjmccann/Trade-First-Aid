class CreateTeams < ActiveRecord::Migration[5.1]
  def change
    create_table :teams do |t|
      t.string :name
      t.integer :manager_id
      t.boolean :imported

      t.references :league, foreign_key: true

      t.timestamps
    end


    add_column :users, :favorite_team, :integer
  end
end
