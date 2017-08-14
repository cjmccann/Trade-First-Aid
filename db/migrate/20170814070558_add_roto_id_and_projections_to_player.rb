class AddRotoIdAndProjectionsToPlayer < ActiveRecord::Migration[5.1]
  def change
    add_column :players, :proj_stats, :text
    add_column :players, :roto_id, :integer
  end
end
