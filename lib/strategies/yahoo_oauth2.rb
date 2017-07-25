require 'omniauth-oauth2'

module OmniAuth
  module Strategies
    class YahooOAuth2 < OmniAuth::Strategies::OAuth2
      option :name, 'yahoo_oauth2'

      option :client_options, {
        site: 'https://api.login.yahoo.com/',
        authorize_url: '/oauth2/request_auth',
        token_url: '/oauth2/get_token',
      }

      option :authorize_params, {
        scope: 'openid,fspt-r',
        response_type: 'code',
        redirect_uri: 'http://lvh.me/users/auth/yahoo/callback',
        nonce: (rand(10 ** 30).to_s.rjust(30,'0')),
      }

      option :token_params, {
        redirect_uri: 'http://lvh.me/users/auth/yahoo/callback',
      }

      uid {
        access_token.params['xoauth_yahoo_guid']
      }

      info do
        {
          :name => raw_info['profile']['nickname'],
          :username => raw_info['profile']['guid'],
        }
      end

      extra do
        {
          'raw_info' => raw_info
        }
      end

      def raw_info
        if @raw_info.nil?
          base_info_url = "https://social.yahooapis.com/v1/user/#{uid}/profile?format=json"
          base_info = access_token.get(base_info_url).parsed
          @raw_info = base_info.merge(decoded_id_token)
        else
          @raw_info
        end
      end

      def decoded_id_token
        # TODO: validate signature
        
        encoded_strs = access_token.params['id_token'].split('.')

        { 
          id_token: {
            jose_header: JSON.parse(Base64.decode64(encoded_strs[0])),
            payload: JSON.parse(Base64.decode64(encoded_strs[1])),
            signature: encoded_strs[2]
          }
        }
      end

      def build_access_token 
        verifier = request.params['code']

        auth = "Basic #{Base64.strict_encode64("#{options.client_id}:#{options.client_secret}")}"

        token = client.get_token({
          redirect_uri: callback_url, 
          code: verifier, 
          grant_type: 'authorization_code', 
          headers: { 'Authorization' => auth } }. 
          merge(token_params.to_hash(symbolize_keys: true)),
          deep_symbolize(options.auth_token_params))

        token
      end
    end 
  end
end

OmniAuth.config.add_camelization 'yahoo_oauth2', 'YahooOAuth2'
