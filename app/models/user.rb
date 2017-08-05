class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, 
         :recoverable, :rememberable, :trackable,
         :omniauthable, :omniauth_providers => [:yahoo]

  validates :username, :presence => true, :uniqueness => true

  has_many :leagues
  has_many :teams

  def self.from_omniauth(auth)
    where(provider: auth.provider, username: auth.uid).first_or_create do |user|

      user.provider = auth.provider
      user.username = auth.uid
      # user.email = auth.info.email
      user.password = Devise.friendly_token[0,20]
      user.token = auth["credentials"]["token"]
      user.expires_at = auth["credentials"]["expires_at"]
      user.refresh_token = auth["credentials"]["refresh_token"]
      user.icon_url = auth['extra']['raw_info']['profile']['image']['imageUrl']
    end
  end

  def api_client
    Yahoo::APIClient.get(self)
  end

  def initialize_leagues
    League.from_seasons(self, api_client.get_user_seasons)
  end

  def update_user_token(oauth_token)
    self.token = oauth_token.token
    self.expires_at = oauth_token.expires_at
    self.refresh_token = oauth_token.refresh_token
    self.save
  end
end
