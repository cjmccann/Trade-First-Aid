class CreateTrades < ActiveRecord::Migration[5.1]
  def change
    create_table :trades do |t|
      t.text :players_in
      t.text :players_out
      t.references :league, foreign_key: true
      t.references :user, foreign_key: true
      t.references :team, foreign_key: true
      t.integer :partner
      t.text :results

      t.timestamps
    end
  end
end
