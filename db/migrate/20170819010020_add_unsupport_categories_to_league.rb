class AddUnsupportCategoriesToLeague < ActiveRecord::Migration[5.1]
  def change
    add_column :leagues, :unsupported_categories, :text
  end
end
