class AddSyncedAtDateTimeToTeam < ActiveRecord::Migration[5.1]
  def change
    add_column :leagues, :synced_at, :datetime
  end
end
