class AddWeekUpdatedToLeagues < ActiveRecord::Migration[5.1]
  def change
    add_column :leagues, :week_updated, :integer
  end
end
