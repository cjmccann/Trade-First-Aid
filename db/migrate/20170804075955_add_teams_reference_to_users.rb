class AddTeamsReferenceToUsers < ActiveRecord::Migration[5.1]
  def change
    add_reference :teams, :user, index: true
  end
end
