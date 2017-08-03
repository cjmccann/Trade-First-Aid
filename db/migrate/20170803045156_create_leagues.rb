class CreateLeagues < ActiveRecord::Migration[5.1]
  def change
    create_table :leagues do |t|
      t.string :game_id
      t.string :code
      t.string :league_id
      t.integer :manager_id

      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
