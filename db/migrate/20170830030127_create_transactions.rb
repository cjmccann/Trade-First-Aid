class CreateTransactions < ActiveRecord::Migration[5.1]
  def change
    create_table :transactions do |t|
      t.references :league, foreign_key: true
      t.string :type
      t.text :metadata

      t.timestamps
    end
  end
end
