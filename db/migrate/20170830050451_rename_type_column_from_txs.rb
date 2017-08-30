class RenameTypeColumnFromTxs < ActiveRecord::Migration[5.1]
  def change
    remove_column :transactions, :type
    add_column :transactions, :tx_type, :string
  end
end
