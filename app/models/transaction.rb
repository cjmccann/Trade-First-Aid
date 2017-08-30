class Transaction < ApplicationRecord
  belongs_to :league

  serialize :metadata

  def self.from_sync(league, data)
    has_updates = false

    data.each do |k, v|
      next if k == 'players'

      v.each do |k2, v2|
        has_updates = true if has_updates == false

        league.transactions.create(tx_type: k2, metadata: { k => v2 })
      end
    end

    data['players'].each do |k, v|
      has_updates = true if has_updates == false

      if v.has_key?(:add) && v.has_key?(:drop)
        league.transactions.create(tx_type: 'add-drop', metadata: { 't1' => v[:add], 't2' => v[:drop] })
      elsif v.has_key?(:add)
        league.transactions.create(tx_type: 'add', metadata: { 't1' => v[:add] })
      elsif v.has_key?(:drop)
        league.transactions.create(tx_type: 'drop', metadata: { 't2' => v[:drop] })
      end
    end

    has_updates
  end 
end
