class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, 
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, :omniauth_providers => [:yahoo]

  def self.from_omniauth(auth)
    where(provider: auth.provider, username: auth.uid).first_or_create do |user|

      user.provider = auth.provider
      user.username = auth.uid
      # user.email = auth.info.email
      user.password = Devise.friendly_token[0,20]

      # response = token.get('/fantasy/v2/users;use_login=1/games')
    end
  end
end
